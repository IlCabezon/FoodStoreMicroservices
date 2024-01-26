const { ValidateSignature } = require('../../utils');
const { AuthorizeError } = require("../../utils/app-errors")

module.exports = async (req,res,next) => {
    
    const isAuthorized = await ValidateSignature(req);

    if(isAuthorized){
        return next();
    }
    throw new AuthorizeError("not authorized")
}