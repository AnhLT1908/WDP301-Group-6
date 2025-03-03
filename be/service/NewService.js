import House from '../model/House.js';
import New from '../model/New.js'
import getCurrentUser from '../utils/getCurrentUser.js';
import getPaginationData from '../utils/getPaginationData.js';

export const addOne = async(req, res)=>{
    try {
        const { houseId } = req.body;
        const house = await House.findById(houseId);
        if (!house) {
            throw new Error ("Not found houses")
        }
        const authorId = getCurrentUser(req);
        const data = await New.create({ ...req.body, authorId });
        res.status(201).json(data);
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
          });
    }
}

export const getAll = async(req, res)=>{
    try {
        const { houseId } = req.params;
        const { page, limit, title, content } = req.query;
        const query = { houseId,deleted: false };
        if (title) {
            query.title = { $regex: title, $options: "i" };
        }
        if (content) {
            query.content = { $regex: content, $options: "i" };
        }
        const populateField = ['authorId']
        const data = await getPaginationData(New, page, limit, query,populateField);
        res.status(201).json(data);
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
          });
    }
}

export const getOne = async(req, res)=> {
    try {
        const { newsId } = req.params;
        console.log("Received newsId:", newsId); // Debug ID

        const data = await New.findById(newsId)
        // .populate([
        //     { path: "authorId" },
        //     { path: "commentsId" },
        //     { path: "likedBy" },
        // ]);
        // return {
        //     ...data._doc,
        //     liked: data.length,
        // };
        res.status(201).json(data);
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
          });
    }
}

export const updateOne = async(req, res)=>{
    try {
        const { newsId } = req.params;
        await New.findByIdAndUpdate(newsId, { ...req.body });
        const newData = await New.findById(newsId);
        res.status(201).json(newData);
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
          });
    }
}

export const deleteOne = async (req, res) => {
    try {
        const { newsId } = req.params;

        // Cập nhật trường deleted = true
        const updatedNews = await New.findByIdAndUpdate(
            newsId,
            { deleted: true, deletedAt: Date.now() },
            { new: true } // Trả về dữ liệu mới sau khi cập nhật
        );

        if (!updatedNews) {
            return res.status(404).json({ message: "Bài viết không tồn tại" });
        }

        return res.status(200).json({
            message: "Xóa bài viết thành công",
            data: updatedNews,
        });
    } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getList = async (req, res, next) => {
    try {
        const news = await New.find(); 
        res.status(200).json({
            success: true,
            count: news.length,
            data: news,
        });
    } catch (error) {
        next(error); 
    }
};
