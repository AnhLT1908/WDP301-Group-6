const getPaginationData = async (model, page = 1, limit = 200, filter = {}, populateFields = []) => {
    try {
        const pageNumber = parseInt(page) || 1;
        const limitPerPage = parseInt(limit) || 10;
        const totalDocuments = await model.countDocuments(filter);
        const totalPages = Math.ceil(totalDocuments / limitPerPage);
        let query = model.find(filter)
            .skip((pageNumber - 1) * limitPerPage)
            .limit(limitPerPage);
        populateFields.forEach((field) => {
            query = query.populate(field);
        });
        const data = await query.exec();
        return {
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalDocuments,
                limitPerPage,
            },
            data,
        };
    } catch (error) {
        throw new Error(`Error fetching paged data: ${error.message}`);
    }
};

export default getPaginationData;
