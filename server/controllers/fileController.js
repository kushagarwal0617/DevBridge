const File = require('../models/File');
const Project = require('../models/Project');

const assertMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { ok: false, code: 404, message: 'Project not found' };
  const isMember = project.members.some((m) => m.toString() === userId);
  if (!isMember) return { ok: false, code: 403, message: 'You are not a member of this project' };
  return { ok: true };
};

// Upload a file to a project — the actual upload to Cloudinary already happened
// in the Multer middleware before this function runs; req.file contains the result
const uploadFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log("===== FILE REQUEST =====");
    console.log("Project:", projectId);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const check = await assertMembership(projectId, req.user.id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded' });
    }

    const file = await File.create({
      project: projectId,
      uploader: req.user.id,
      fileName: req.file.originalname,
      fileUrl: req.file.path, // Cloudinary's returned URL, placed here by multer-storage-cloudinary
      fileType: req.file.mimetype,
    });

    const populatedFile = await file.populate('uploader', 'name email');

    res.status(201).json(populatedFile);
  }  catch (error) {
  console.error("===== UPLOAD ERROR =====");
  console.error(error);
  console.error("Message:", error.message);
  console.error("Stack:", error.stack);

  res.status(500).json({
    message: "Server error",
    error: error.message,
  });
}
};

// List all files for a project
const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;

    const check = await assertMembership(projectId, req.user.id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const files = await File.find({ project: projectId })
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a file record (removes it from your app's list — doesn't delete from Cloudinary in this simple version)
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const check = await assertMembership(file.project, req.user.id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    await file.deleteOne();
    res.status(200).json({ message: 'File removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { uploadFile, getProjectFiles, deleteFile };