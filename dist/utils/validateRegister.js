"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validateRegister = (options) => {
    if (options.username.length <= 2) {
        return [
            {
                field: "username",
                message: "length should be greater than length 2 "
            }
        ];
    }
    if (!options.email.includes('@')) {
        return [
            {
                field: "email",
                message: "email are unvalid"
            }
        ];
    }
    if (options.username.includes('@')) {
        return [
            {
                field: "username",
                message: "username does not contain @"
            }
        ];
    }
    if (options.password.length <= 3) {
        return [
            {
                field: "password",
                message: "password length should be greater than length 3 "
            }
        ];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map