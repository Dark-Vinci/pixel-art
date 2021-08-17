/* 
    MODELS, MODELSCHEMA AND VALIDATE FUNCTION FOR THE ART
 */
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');

// schema that the art model will be moddeled on
const artSchema = new Schema({
    // the shape of the pixels
    shape: {
        type: String,
        required: true,
        default: 'rect',
        enum: [ 'rect', 'circ' ]
    },

    // the size of the pixels 
    size: {
        type: Number,
        min: 1,
        max: 4,
        default: 2,
        set: v => v.round(),
        enum: [ 1, 2, 3, 4 ],
        required: true,
        validate: {
            validator: function (v) {
                return Number.isInteger(v) && v < 5 && v > 0;
            },
            message: 'you should send an integer value'
        }
    },

    // the dimension (height, width) of the art
    dimension: {
        height: {
            type: Number,
            required: true,
            validate: {
                validator: function (v) {
                    return v && Number.isInteger(v)
                },
                message: 'you should send an integer value'
            }
        },

        width: {
            type: Number,
            required: true,
            validate: {
                validator: function (v) {
                    return v && Number.isInteger(v)
                },
                message: 'you should send an integer value'
            }
        }
    },

    // the drawing is a type of array that embeds arrays of strings
    pixel: {
        type: [
            {
                type: [ String ]
            }
        ]
    }
});

// compiling the art schema into a drawing model
const Art = mongoose.model('Art', artSchema);

function validateArt (input) {
    // creating the dimension schema
    const dimensionSchema = Joi.object({
        height: Joi.number()
            .integer()
            .required()
            .min(50)
            .max(100),

        width: Joi.number()
            .integer()
            .required()
            .min(50)
            .max(100)
    });
    
    // creating the pixel schema
    const pixelSchema = Joi.array().items(
        Joi.array().items(
            Joi.string()
                .required()
                .min(9)
                .max(9)
        )
    );

    const schema = Joi.object({
        shape: Joi.string()
            .required()
            .min(4)
            .max(4),

        size: Joi.number()
            .required()
            .min(1)
            .max(4),
        
        dimension: dimensionSchema,

        pixel: pixelSchema
    });

    const result = schema.validate(input);
    return result;
}

function validateArt (input) {
    // creating the pixel schema
    const pixelSchema = Joi.array().items(
        Joi.array().items(
            Joi.string()
                .required()
                .min(9)
                .max(9)
        )
    );

    const schema = Joi.object({
        shape: Joi.string()
            .min(4)
            .max(4),

        size: Joi.number()
            .min(1)
            .max(4),

        pixel: pixelSchema
    });

    const result = schema.validate(input);
    return result;
}

module.exports = {
    Art,
    validateArt
}