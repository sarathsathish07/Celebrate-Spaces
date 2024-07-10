import User from '../models/userModel.js';

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const createUser = async (userData) => {
  return await User.create(userData);
};

const findUserById = async (id) => {
  return await User.findById(id);
};  

const saveUser = async (user) => {
  return await user.save();
};

export {
  findUserByEmail,
  createUser,
  findUserById,
  saveUser,
};
