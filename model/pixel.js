const { Schema } = require('mongoose');
const mongoose = require('mongoose');

// const pixelSchema = new Schema({
//     value: {
//         type: [
//             {
//                 name: 
//             }
//         ],

//         validate: {
//             validator: function (v) {
//                 return v && v.length > 0
//             },
//             message: 'cant have an empty pixelled artwork'
//         }
//     }
// });

const Pixel = mongoose.model('Pixel', pixelSchema);

// module.exports = {
//     Pixel,
//     pixelSchema
// };