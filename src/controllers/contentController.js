const Content = require('../models/Content');
const Module = require('../models/Module');
const { VALID_CONTENT_STATUS } = require('../config/constants');

// Register content
const register = async (req, res) => {
    try {
        const moduleID = parseInt(req.params.moduleid);
        const { title, description, pageNumber, status } = req.body;

        const newContent = await registerContent({
            moduleID: moduleID,
            title: title,
            description: description,
            pageNumber: pageNumber,
            status: status
        })

        res.json({ 
            message: 'Content registered successfully', 
            content: newContent
        });

    } catch (error) {
        console.error('Register content error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update content
const update = async (req, res) => {
    try {
        const contentID = parseInt(req.params.contentid);
        const { title, description, pageNumber, status } = req.body;

        // Check if contentID exists
        if (!contentID) return res.status(400).json({ error: 'Content ID is required' });

        const existingContent = await Content.findById(contentID);
        if (!existingContent) return res.status(404).json({ error: 'Content not found' });

        // Check if moduleID exists
        const moduleID = parseInt(req.params.moduleid) || existingContent.moduleID;
        const module = await Module.findById(moduleID);
        if (!module) return res.status(404).json({ error: 'Module not found' });

        // Check if page number is already used in the module
        if (pageNumber !== undefined) {
            // Validate positive integer
            if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
                return res.status(400).json({ error: 'pageNumber must be a positive integer' });
            }

            // Check duplicates for active content
            const moduleContents = await Content.findByModuleId(moduleID);
            const duplicate = moduleContents.some(
                c => c.pageNumber === pageNumber && c.status === 'active' && c.contentID !== contentID
            );

            if (duplicate) {
                return res.status(400).json({ error: 'Selected page number already used in the module' });
            }
        }

        // Validate status
        if (status !== undefined && !VALID_CONTENT_STATUS.includes(status)) {
            return res.status(400).json({ 
                error: `Invalid status. Must be: ${VALID_CONTENT_STATUS.join(', ')}` 
            });
        }

        // Prepare update data
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (pageNumber !== undefined) updateData.pageNumber = pageNumber;
        if (status !== undefined) updateData.status = status;

        // Update content
        const updatedContent = await Content.update(contentID, updateData);
        res.json({ message: 'Content updated successfully', 
            content: {
                contentID: updatedContent.contentID,
                moduleID: updatedContent.moduleID,
                title: updatedContent.title,
                description: updatedContent.description,
                pageNumber: updatedContent.pageNumber,
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
        const contentID = parseInt(req.params.contentid);
        const content = await Content.findById(contentID);
        if (!content) return res.status(404).json({ error: 'Content not found' });
        res.json({ content });
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all content for a specific module
const getAll = async (req, res) => {
    try {
        const moduleID = parseInt(req.params.moduleid);
        if (!moduleID) return res.status(400).json({ error: 'Module ID is required' });

        const moduleContents = await Content.findByModuleId(moduleID);

        res.json({ contents: moduleContents });
    } catch (error) {
        console.error('Get module content error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get metadata
const getMeta = (req, res) => {
    res.json({ status: VALID_CONTENT_STATUS });
};


// Registering function
const registerContent = async ({
    moduleID, 
    title,
    description,
    pageNumber,
    status
}, client=null) => {
    try {
        // Validate module id is provided
        if (!moduleID) {
            throw new Error('Module ID is required');
        }

        // Basic validation
        if (!title || pageNumber == null || !Number.isInteger(pageNumber) || pageNumber <= 0) {
            throw new Error('Title and a positive pageNumber are required');
        }

        // Validate status
        const contentStatus = status || 'draft';

        if (!VALID_CONTENT_STATUS.includes(contentStatus)) {
            throw new Error(`Invalid status. Must be: ${VALID_CONTENT_STATUS.join(', ')}`);
        }

        // Validate module ID
        const module = await Module.findById(moduleID, client);
        if (!module) {
            throw new Error('Invalid module ID. Module does not exist.');
        }

        // Check if page number is already used in another content that is "active"
        const existingContents = await Content.findByModuleId(moduleID);
        const duplicate = existingContents.some(
            c => c.pageNumber === pageNumber && c.status === 'active'
        );

        if (duplicate) {
            throw new Error('Selected page number already used in the module');
        }

        // Create content
        const newContent = await Content.create({ moduleID, title, description, pageNumber, status: contentStatus }, client);
        return { 
            contentID: newContent.contentID,
            moduleID: newContent.moduleID,
            title: newContent.title,
            description: newContent.description,
            pageNumber: newContent.pageNumber,
            status: newContent.status,
        };

    } catch (error) {
        console.error('Register content error:', error);
        throw new Error('Internal server error');
    }
};

const updateContent = async ({
    moduleID,
    contentID,
    title, 
    description, 
    pageNumber, 
    status
}, client=null) => {
    try {
        // Check if contentID exists
        if (!contentID) {
            throw new Error('Content ID is required' );
        }

        const existingContent = await Content.findById(contentID);
        if (!existingContent) {
            throw new Error('Content not found')
        }

        // Check if moduleID exists
        const module = await Module.findById(moduleID);
        if (!module) {
            throw new Error('Module not found')
        }

        // Check if page number is already used in the module
        if (pageNumber !== undefined) {
            // Validate positive integer
            if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
                throw new Error('pageNumber must be a positive integer');
            }

            // Check duplicates for active content
            const moduleContents = await Content.findByModuleId(moduleID);
            const duplicate = moduleContents.some(
                c => c.pageNumber === pageNumber && c.status === 'active' && c.contentID !== contentID
            );

            if (duplicate) {
                throw new Error('Selected page number already used in the module' );
            }
        }

        // Validate status
        if (status !== undefined && !VALID_CONTENT_STATUS.includes(status)) {
            throw new Error(`Invalid status. Must be: ${VALID_CONTENT_STATUS.join(', ')}`);
        }

        // Prepare update data
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (pageNumber !== undefined) updateData.pageNumber = pageNumber;
        if (status !== undefined) updateData.status = status;

        // Update content
        const updatedContent = await Content.update(contentID, updateData, client);
        return {
            contentID: updatedContent.contentID,
            moduleID: updatedContent.moduleID,
            title: updatedContent.title,
            description: updatedContent.description,
            pageNumber: updatedContent.pageNumber,
            status: updatedContent.status,
        };

    } catch (error) {
        console.error('Update content error:', error);
        throw new Error('Internal server error');
    }
};

// Sync status with course status
const syncContentStatus = async (moduleID) => {
    try {
        const module = await Module.findById(moduleID);
        if (!module) {
            throw new Error('Invalid module ID. Module not found.');
        }

        const contents = await Content.findByModuleId(moduleID);
        console.log(contents)
        if (contents.length > 0) {
            for (c of contents) {
                // if content status is inactive (deleted), do not change the status
                if (c.status === 'inactive') {
                    break;
                }

                // otherwise, sync the status with module
                const updated = await Content.update(c.contentID, {
                    status: module.status
                })
                console.log(updated)
            }
        }
    } catch (error) {
        throw new Error('Content status sync error: ' + error);
    }
}

module.exports = {
    register,
    update,
    getContent,
    getAll,
    getMeta,
    registerContent,
    updateContent,
    syncContentStatus
};
