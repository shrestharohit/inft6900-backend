const Pathway = require('../models/Pathway');
const User = require('../models/User');
const { VALID_PATHWAY_STATUS } = require('../config/constants');

// Register pathway
const register = async (req, res) => {
    try {
        const { name, userID, outline, status } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Pathway name is required' });
        }

        const pathwayStatus = status || 'draft';
        if (!VALID_PATHWAY_STATUS.includes(pathwayStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be: ${VALID_PATHWAY_STATUS.join(', ')}`
            });
        }

        const user = await User.findById(userID)
        if (!user || user.role !== 'course_owner') {
            return res.status(404).json({
                error: 'User ID invalid. Course owner account not found.'
            })
        }

        const newPathway = await Pathway.create({ name, userID, outline, status: pathwayStatus });
        res.json({
            message: 'Pathway registered successfully',
            pathway: {
                pathwayID: newPathway.pathwayID,
                name: newPathway.name,
                userID: newPathway.userID,
                outline: newPathway.outline,
                status: newPathway.status,
                createdDate: newPathway.createdDate
            }
        });
    } catch (error) {
        console.error('Register pathway error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update pathway
const update = async (req, res) => {
    try {
        const pathwayID = parseInt(req.params.pathwayid);
        const { name, outline, status } = req.body;

        // Validate pathwayID
        if (!pathwayID) return res.status(400).json({ error: 'Pathway ID is required' });

        // Check if pathwayID exists
        const existingPathway = await Pathway.findById(pathwayID);
        if (!existingPathway) return res.status(404).json({ error: 'Pathway not found' });

        // Validate status
        if (status !== undefined && !VALID_PATHWAY_STATUS.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Must be: ${VALID_PATHWAY_STATUS.join(', ')}`
            });
        }

        // Prepare update data
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (outline !== undefined) updateData.outline = outline;
        if (status !== undefined) updateData.status = status;

        // Update pathway
        const updatedPathway = await Pathway.update(pathwayID, updateData);
        res.json({
            message: 'Pathway updated successfully',
            pathway: {
                pathwayID: updatedPathway.pathwayID,
                name: updatedPathway.name,
                outline: updatedPathway.outline,
                status: updatedPathway.status,
                createdDate: updatedPathway.createdDate
            }
        });
    } catch (error) {
        console.error('Update pathway error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single pathway
const getPathway = async (req, res) => {
    try {
        const pathwayID = parseInt(req.params.pathwayid);
        const pathway = await Pathway.findById(pathwayID);
        if (!pathway) return res.status(404).json({ error: 'Pathway not found' });
        res.json({ pathway });
    } catch (error) {
        console.error('Get pathway error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single pathway
const getUserPathways = async (req, res) => {
    try {
        const userID = parseInt(req.params.userID);
        if (!userID) {
            return res.status(404).json({
                error: 'UserID is required.'
            })
        }

        const pathways = await Pathway.findByUserId(userID);
        res.json(pathways);
    } catch (error) {
        console.error('Get user pathway error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get approval list (status = wait_for_approval)
const getApprovalList = async (req, res) => {
    try {
        const pathways = await Pathway.findByStatus("wait_for_approval");
        res.json(pathways);
    } catch (error) {
        console.error('Get wait for approval pathways error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get detailed pathway info
const getDetail = async (req, res) => {
    try {
        const pathwayID = req.params.pathwayid;

        if (!pathwayID) {
            return res.status(400).json({ error: 'Pathway ID is required' });
        }

        // Find pathway
        const pathway = await Pathway.getDetail(pathwayID);
        if (!pathway) {
            return res.status(404).json({ error: 'Pathway not found' });
        }

        // Get courses inside pathway
        const courses = await Pathway.getCourses(pathwayID);

        const result = {
            pathwayID: pathway.pathwayID,
            name: pathway.name,
            outline: pathway.outline,
            durationWeeks: pathway.durationWeeks,
            category: pathway.category,
            level: pathway.level,
            status: pathway.status,
            createdDate: pathway.createdDate,
            courses: courses
        };

        res.json(result);
    } catch (error) {
        console.error('Get pathway detail error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all courses in a pathway
const getCoursesInPathway = async (req, res) => {
  try {
    const pathwayID = parseInt(req.params.pathwayid);
    if (!pathwayID) return res.status(400).json({ error: 'Pathway ID is required' });

    const pathway = await Pathway.findById(pathwayID);
    if (!pathway) return res.status(404).json({ error: 'Pathway not found' });

    const courses = await Pathway.getCourses(pathwayID);
    res.json({ pathwayID, courses });
  } catch (error) {
    console.error('Get courses in pathway error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all pathways
const getAll = async (req, res) => {
    try {
        const pathways = await Pathway.getAll();
        res.json({ pathways });
    } catch (error) {
        console.error('Get all pathways error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get metadata (status options)
const getMeta = (req, res) => {
    res.json({ status: VALID_PATHWAY_STATUS });
};

module.exports = {
    register,
    update,
    getPathway,
    getAll,
    getMeta,
    getApprovalList,
    getDetail,
    getUserPathways,
    getCoursesInPathway
};
