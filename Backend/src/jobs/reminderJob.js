import cron from "node-cron";
import { Payment } from "../models/Payment.model.js";
import EmailVerification from "../models/EmailVerification.js";
import { getAuth } from "firebase-admin/auth";
import { sendReminderEmail } from "../services/emailService.js";

/**
 * Sanitizes user-controlled strings to prevent line-oriented log injection (CWE-117)
 */
const sanitizeLogString = (str) => {
    if (typeof str !== "string") return "";
    return str.replace(/[\r\n\x00-\x1f\x7f-\x9f]/g, " ").trim();
};

const reminderJob = cron.schedule("* * * * *", async () => {
    console.log("Running Remetra reminder job...");

    try {
        const now = new Date();

        // Reminder window: next 3 days
        const reminderLimit = new Date();
        reminderLimit.setDate(reminderLimit.getDate() + 3);

        const payments = await Payment.find({
            dueDate: {
                $gte: now,
                $lte: reminderLimit
            },
            status: { $ne: "Paid" },
            reminderSent: false
        });

        console.log(`Found ${payments.length} payment(s) for reminder.`);

        for (const payment of payments) {
            try {
                // Get Firebase user
                const user = await getAuth().getUser(payment.firebaseUid);

                if (!user.email) {
                    console.log(
                        `No email found for Firebase user: ${payment.firebaseUid}`
                    );
                    continue;
                }

                // Ensure email address belongs to a verified mailbox (CWE-287 Reminder Email Authentication Defense)
                const isEmailVerified = user.emailVerified || (await EmailVerification.exists({ email: user.email.toLowerCase(), verified: true }));
                if (!isEmailVerified) {
                    console.warn(
                        `[ReminderJob] Skipping reminder for unverified user ${user.uid} (${sanitizeLogString(user.email)})`
                    );
                    continue;
                }

                // If user had a verified record in MongoDB but Firebase hadn't synced, sync it now
                if (!user.emailVerified && isEmailVerified) {
                    getAuth().updateUser(user.uid, { emailVerified: true }).catch(() => {});
                }

                // Calculate remaining days
                const timeDifference =
                    payment.dueDate.getTime() - now.getTime();

                const daysRemaining = Math.ceil(
                    timeDifference / (1000 * 60 * 60 * 24)
                );

                // --------------------------------
                // Category-specific message
                // --------------------------------

                let paymentDescription = "";

                if (payment.category === "Recharge") {
                    if (payment.rechargeType === "Prepaid") {
                        paymentDescription = `
Your ${payment.provider} prepaid recharge
for ${payment.mobileNumber || "your mobile number"}
is expiring soon.
                        `;
                    } else if (payment.rechargeType === "Postpaid") {
                        paymentDescription = `
Your ${payment.provider} postpaid bill
for ${payment.mobileNumber || "your mobile number"}
is due soon.
                        `;
                    } else {
                        paymentDescription = `
Your ${payment.provider} recharge is due soon.
                        `;
                    }
                }

                else if (payment.category === "Electricity") {
                    paymentDescription = `
Your electricity bill from ${payment.provider}
is due soon.
                    `;
                }

                else if (payment.category === "Subscription") {
                    paymentDescription = `
Your ${payment.provider} subscription
is due for renewal soon.
                    `;
                }

                // --------------------------------
                // Basic payment details
                // --------------------------------

                let paymentDetails = `
For: ${payment.personName}
Title: ${payment.title}
Category: ${payment.category}
Provider: ${payment.provider}
Amount: ₹${payment.amount}
Due Date: ${payment.dueDate.toDateString()}
Days Remaining: ${daysRemaining}
`;

                // --------------------------------
                // Recharge-specific details
                // --------------------------------

                if (payment.category === "Recharge") {

                    if (payment.mobileNumber) {
                        paymentDetails += `
Mobile Number: ${payment.mobileNumber}`;
                    }

                    if (payment.rechargeType) {
                        paymentDetails += `
Recharge Type: ${payment.rechargeType}`;
                    }

                    if (payment.validityDays) {
                        paymentDetails += `
Validity: ${payment.validityDays} days`;
                    }
                }

                // --------------------------------
                // Electricity-specific details
                // --------------------------------

                if (
                    payment.category === "Electricity" &&
                    payment.consumerId
                ) {
                    paymentDetails += `
Consumer ID: ${payment.consumerId}`;
                }

                // --------------------------------
                // Optional notes
                // --------------------------------

                if (payment.notes) {
                    paymentDetails += `
Notes: ${payment.notes}`;
                }

                // --------------------------------
                // Email
                // --------------------------------

                const subject = `Remetra Reminder: ${payment.title}`;

                const message = `
Hello,

This is a reminder from Remetra.

${paymentDescription}

Payment Details
-------------------------
${paymentDetails}

Please make the required payment before the due date.

Thank you,
Remetra
Smart Bill Reminders & Spend Insights
                `;

                // Send email
                await sendReminderEmail(
                    user.email,
                    subject,
                    message
                );

                // Mark reminder as sent only after successful email
                payment.reminderSent = true;

                await payment.save();

                console.log(
                    `Reminder sent to ${sanitizeLogString(user.email)} for payment "${sanitizeLogString(payment.title)}" (ID: ${payment._id})`
                );

            } catch (error) {
                console.error(
                    `Failed to process reminder for payment "${sanitizeLogString(payment.title)}" (ID: ${payment._id}):`,
                    sanitizeLogString(error.message)
                );
            }
        }

    } catch (error) {
        console.error(
            "Remetra reminder job failed:",
            error.message
        );
    }
});

export default reminderJob;