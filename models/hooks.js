exports.handleSaveError = function(error, data, next) {
    const { name, code } = error;
    error.status = name === "MongoServerError" && code === 11000 ? 409 : 400;
    next();
};

exports.preUpdate = function(next) {
    this.options.new = true;
    this.options.runValidators = true;
    next();
};