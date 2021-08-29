/* 
    MODELS, MODELSCHEMA AND VALIDATE FUNCTION FOR THE ART
 */

    // module dependencies
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');

// const { pixelSchema } = require('./pixel');

// schema that the art model will be moddeled on
const artSchema = new Schema({     
    // the shape of the pixels
    name: {
        type: String,
        required: true,
        minlength: 1
    },

    pixel: {
        type: [ String ],
        validate: {
            validator: function (v) {
                return v && v.length > 0
            }
        }
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

// compiling the art schema into a drawing model
const Art = mongoose.model('Art', artSchema);

// function to validate the creation of an artwork
function validateArt (input) {
    // creating the dimension schema
    
    // creating the pixel schema
    const pixelSchema = Joi.array().items(Joi.string());

// the real schema for this function
    const schema = Joi.object({
        name: Joi.string()
            .required()
            .min(1),

        pixel: pixelSchema
    });

    const result = schema.validate(input);
    return result;
}

// bulk export
module.exports = {
    Art,
    validateArt,
}