class ApiError extends Error {
    constructor(statusCode, message, data, error){
        super(message)
            this.statusCode=statusCode
            this.message=message
            this.data=data
            this.error=[]


            if(stack){
                this.stack = this.stack
            }else{
                Error.captureStackTrace(this, this.constructor)
            }
    }
}

export {ApiError}