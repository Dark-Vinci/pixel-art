/* 
    ADMIN SCHEMA, MODEL AND VALIDATING FUNCTIONS
 */

const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

// the schema for modelling the admin document
const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 30
    },

    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 50
    },

    password: {
        type: String,
        required: true,
        maxlength: 1024
    }
});

// instance method for generating admin authentification token
adminSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ 
        _id: this._id, 
        username: this.username, 
        isAdmin: true 
    }, config.get('jwtPass'));

    return token;
}

const Admin = mongoose.model('Admin', adminSchema);

// function to validate the creation of an admin
function validateAdmin (input) {
    const schema = Joi.object({
        username: Joi.string()
            .required()
            .min(2)
            .max(50),

        password: Joi.string()
            .required()
            .min(7)
            .max(50),

        email: Joi.string()
            .email()
            .required()
    });

    const result = schema.validate(input);
    return result;
}

// function to validate the loging in of admin
function validateAdminLogin (input) {
    const schema = Joi.object({
        password: Joi.string()
            .required()
            .min(7)
            .max(50),

        email: Joi.string()
            .email()
            .required()
    });

    const result = schema.validate(input);
    return result;
}

// function to validate the changing of pasword by an admin
function validateAdminChangePassword (input) {
    const schema = Joi.object({
        oldPassword: Joi.string()
            .required()
            .min(7)
            .max(50),

        newPassword: Joi.string()
            .required()
            .min(7)
            .max(50)
    });

    const result = schema.validate(input);
    return result;
}

// bult export
module.exports = {
    Admin,
    validateAdmin,
    validateAdminLogin,
    validateAdminChangePassword
}