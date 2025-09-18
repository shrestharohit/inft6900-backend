const Content = require('../models/Content');
const Module = require('../models/Module');
const { VALID_CONTENT_STATUS } = require('../config/constants');

const register = async (req, res) => {
    try {
        const moduleid = req.params.moduleid;
        const { title, description, contenttype, pagenumber, status } = req.body;

        // Validate module id is provided
        if (!moduleid) {
            return res.status(400).json({
                error: 'Module ID is required in header (moduleid) or query parameter (moduleid)'
            });
        }

        // Basic validation
        if (!title || !pagenumber || !status) {
            return res.status(400).json({
                error: 'Title, pagenumber and status are required'
            });
        }

        // Validate status
        const contentStatus = status || 'draft';
        if (!VALID_CONTENT_STATUS.includes(contentStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be: ${VALID_CONTENT_STATUS.join(', ')}`
            });
        }

        // Validate module ID
        const module = await Module.findById(moduleid);
        if (!module) {
            return res.status(400).json({
                error: 'Invalid module ID. Module does not exist.'
            });
        }

        // Validate page number
        if (!pagenumber) {
            return res.status(400).json({
                error: 'Page number is required.'
            });
        }

        // Check if page number is already used in the module
        const existingPageNumber = await Content.findByModuleId(moduleid);
        const duplicatePage = existingPageNumber.find(c => c.pagenumber === pagenumber);
        if (duplicatePage) {
            return res.status(400).json({
                error: 'Selected page number already used in the selected module'
            });
        }


        // Create content
        const newContent = await Content.create({
            moduleid,
            title,
            description,
            contenttype,
            pagenumber,
            status: contentStatus
        });

        res.json({
            message: 'Content registered successfully',
            content: {
                contentid: newContent.contentid,
                moduleid: newContent.moduleid,
                title: newContent.title,
                description: newContent.description,
                contenttype: newContent.contenttype,
                pagenumber: newContent.pagenumber,
                status: newContent.status,
            }
        });

    } catch (error) {
        console.error('Register content error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update content
const update = async (req, res) => {
    try {
        const contentid = req.params.contentid;
        const { title, description, contenttype, pagenumber, status } = req.body;

        // Check if content exists
        const existingContent = await Content.findById(contentid);
        if (!existingContent) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // Validate content ID
        if (!contentid) {
            return res.status(400).json({ 
                error: 'Content ID is required' 
            });
        }

        const moduleid = req.params.moduleid || existingContent.moduleid;

        // Check if moduleID exists
        const moduleExists = await Module.findById(moduleid);
        if (!moduleExists) {
            return res.status(404).json({ error: 'Module not found' });
        }

        // ONLY check page number duplicates if pagenumber is being updated
        if (pagenumber !== undefined) { 
            const moduleContents = await Content.findByModuleId(moduleid);
            const duplicatePage = moduleContents.find(
                c => c.pagenumber === pagenumber && c.contentid !== parseInt(contentid)
            );
            if (duplicatePage) {
                return res.status(400).json({
                    error: 'Selected page number already used in the selected module'
                });
            }
        }

        // Validate status
        let contentStatus = status;
        if (contentStatus !== undefined && !VALID_CONTENT_STATUS.includes(contentStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be: ${VALID_CONTENT_STATUS.join(', ')}`
            });
        }

        // Prepare update data
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (contenttype !== undefined) updateData.contenttype = contenttype;
        if (pagenumber !== undefined) updateData.pagenumber = pagenumber;
        if (status !== undefined) updateData.status = contentStatus;

        // Update content
        const updatedContent = await Content.update(contentid, updateData);

        res.json({
            message: 'Content updated successfully',
            content: {
                contentid: updatedContent.contentid,
                moduleid: updatedContent.moduleid,
                title: updatedContent.title,
                description: updatedContent.description,
                contenttype: updatedContent.contenttype,
                pagenumber: updatedContent.pagenumber,
                status: updatedContent.status,
            }
        });

    } catch (error) {
        console.error('Update content error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// Get single content
const getContent = async (req, res) => {
    try {
        const contentid = req.params.contentid;
        const content = await Content.findById(contentid);
        if (!content) {
            return res.status(404).json({
                 error: 'Invalid content id. Content not found'
            });
        }

        res.json(content);
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all contents
const getAll = async (req, res) => {
    const contents = await Content.getAll();
    res.json({ contents });
};

const getMeta = (req, res) => {
    res.json({ status: VALID_CONTENT_STATUS });
};

module.exports = {
    register,
    update,
    getContent,
    getAll,
    getMeta
};