/* 
    HOME SCHEMA, MODEL AND VALIDATING FUNCTIONS
 */

const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

// schema for home model
const homeSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 7,
        maxlength: 50
    },

    description1: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 100
    },

    description2: {
        type: String,
        minlength: 20,
        maxlength: 100
    },

    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },

    art: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Art'
    }
});

// function to validate the creation of a home object
function validateHome (input) {
    const schema = Joi.object({
        title: Joi.string()
            .required()
            .min(7)
            .max(50),
        
        description1: Joi.string()
            .required()
            .min(20)
            .max(100),

        description2: Joi.string()
            .min(20)
            .max(100),

        art: Joi.objectId()
            .required()
    });

    const result = schema.validate(input);
    return result;
}

// function to validate the editing of a home object
function validateHomeChange (input) {
    const schema = Joi.object({
        title: Joi.string()
            .min(7)
            .max(50),
        
        description1: Joi.string()
            .min(20)
            .max(100),

        description2: Joi.string()
            .min(20)
            .max(100),

        art: Joi.objectId()
    });

    const result = schema.validate(input);
    return result;
}

const Home = mongoose.model('Home', homeSchema);

module.exports = {
    Home,
    validateHome,
    validateHomeChange
}