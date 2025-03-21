import mongoose from 'mongoose';

const oneYearFromNow = () => {
    let date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
};

const ContractSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true
        },
        benA: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        },
        benB: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            validate: {
                validator: async function (value) {
                    const account = await mongoose.model('Account').findById(value);
                    return account && account.accountType === 'Lodger' && account.isContact === true;
                },
                message: 'Bên B phải là Lodger và là người đại diện (isContact: true)!'
            }
        },
        relatedParties: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
            validate: {
                validator: function (v) {
                    return v.length <= 3; // Tối đa 4 người
                },
                message: 'Số lượng bên liên quan không được vượt quá 4 người'
            },
            default: []
        },
        description: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['valid', 'expired'],
            default: 'valid'
        },
        verifyTwoSide: {
            type: String,
            enum: ['unverified', 'verified'],
            default: 'unverified'
        },
        startDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        endDate: {
            type: Date,
            default: oneYearFromNow
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Contract', ContractSchema);
