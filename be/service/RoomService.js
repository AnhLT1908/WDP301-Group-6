import Room from '../model/Room.js';
import House from '../model/House.js'
import Account from '../model/Account.js';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from "cloudinary";
import Bills from "../model/Bills.js";
import exceljs from "exceljs";

export const getOne= async(req, res)=>{
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId)
            .populate("utilities")
            .populate("otherUtilities")
            .populate("houseId")
            .populate("members.avatar")
            .populate({
                path: "houseId",
                populate: { path: "priceList", populate: "base" },
            });
        return {
            ...room._doc,
            currentMember: room.members.length,
        };
    } catch (error) {
        throw error;
    }
}

export const addOne = async(req, res)=>{
    try {
        const { houseId } = req.body;
        const house = await House.findById(houseId);
        const workbook = new exceljs.Workbook();
        const buffer = req.file.buffer;
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Rms@12345", salt);

        const rooms = await Room.find({houseId,deleted:false}); 
        const existingRoomNames = []
        rooms.map(room => {
            existingRoomNames.push(room.name);
        })
        console.log(existingRoomNames);

        for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            if (rowNumber !== 1 && row.getCell(1).value) {
                const roomName = row.getCell(1).value.toString().trim();
                
                if (existingRoomNames.includes(roomName)) {
                    throw new Error(`Phòng "${roomName}" đã tồn tại.`)
                }

            }
        }

        for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            if (rowNumber !== 1 && row.getCell(1).value) {
                const roomName = row.getCell(1).value.toString().trim();
                const floor = roomName.charAt(0);
                
                // Kiểm tra xem tên phòng đã được kiểm tra và không trùng lặp
                if (!existingRoomNames.includes(roomName)) {
                    const rowData = await Room.create({
                        floor: floor,
                        name: roomName,
                        status: row.getCell(2).value,
                        quantityMember: row.getCell(3).value,
                        roomType: row.getCell(4).value,
                        roomPrice: row.getCell(5).value,
                        deposit: row.getCell(6).value,
                        area: row.getCell(7).value,
                        houseId: houseId,
                        utilities: house?.utilities || [],
                        otherUtilities: house?.otherUtilities || [],
                    });
                    const accountData = await Account.create({
                        username: house.name.replace(/\s/g, "") + roomName,
                        password: hashedPassword,
                        accountType: "Lodger",
                        roomId: rowData.id,
                        status: false,
                    });
                    house.numberOfRoom += 1;
                    await house.save();
                }
            }
        }
        return {
            message: "oke",
        };
    } catch (error) {
        throw error
    }
}