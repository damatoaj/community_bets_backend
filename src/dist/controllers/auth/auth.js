var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import formidable from 'formidable';
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const form = formidable({});
        let data;
        form.parse(req, (err, fields, files) => {
            if (err) {
                throw new Error(err);
            }
            console.log(fields, files);
            data = { fields, files };
        });
        console.log('The data: ', data);
        if (!req.body.password || !req.body.confirm_password || (req.body.password !== req.body.confirm_password)) {
            throw new Error('Invalid Password');
        }
        ;
        if (!req.body.email || !req.body.confirm_email || (req.body.email !== req.body.confirm_email)) {
            throw new Error('Invalid Email');
        }
        ;
        res.status(201).send('Success');
    }
    catch (e) {
        console.error('e');
        res.status(400).send(e.message);
    }
    ;
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req);
        res.status(200).send('login success');
    }
    catch (e) {
        console.error('e');
    }
    ;
});
const emailValidation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req);
        res.status(200).send('email validation success');
    }
    catch (e) {
        console.error('e');
    }
    ;
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req);
        res.status(200).send('logout success');
    }
    catch (e) {
        console.error('e');
    }
    ;
});
const resetPasswordRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req);
        res.status(200).send('password reset request success');
    }
    catch (e) {
        console.error('e');
    }
    ;
});
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req);
        res.status(200).send('reset password success');
    }
    catch (e) {
        console.error('e');
    }
    ;
});
module.exports = {
    signup,
    login,
    logout,
    resetPassword,
    resetPasswordRequest,
    emailValidation
};
