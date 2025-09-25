const Pathway = require('../models/Pathway');
const { VALID_PATHWAY_STATUS } = require('../config/constants');

// Register pathway
const register = async (req, res) => {
    try {
        const { name, outline, status } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Pathway name is required' });
        }

        const pathwayStatus = status || 'draft';
        if (!VALID_PATHWAY_STATUS.includes(pathwayStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be: ${VALID_PATHWAY_STATUS.join(', ')}`
            });
        }

        const newPathway = await Pathway.create({ name, outline, status: pathwayStatus });
        res.json({
            message: 'Pathway registered successfully',
            pathway: {
                pathwayID: newPathway.pathwayID,
                name: newPathway.name,
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

        if (!pathwayID) return res.status(400).json({ error: 'Pathway ID is required' });

        const existingPathway = await Pathway.findById(pathwayID);
        if (!existingPathway) return res.status(404).json({ error: 'Pathway not found' });

        if (status !== undefined && !VALID_PATHWAY_STATUS.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Must be: ${VALID_PATHWAY_STATUS.join(', ')}`
            });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (outline !== undefined) updateData.outline = outline;
        if (status !== undefined) updateData.status = status;

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
    getMeta
};
