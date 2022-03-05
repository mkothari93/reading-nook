const { convertNodeHttpToRequest } = require("apollo-server-core");
const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
        .select("-__v -password");
        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
  },

    Mutation: {
        addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);

        return { token, user };
        },

        login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });

        if (!user) {
            throw new AuthenticationError("User not found");
        }

        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
            throw new AuthenticationError("Incorrect credentials");
        }

        const token = signToken(user);
        return { token, user };
        },

        saveBook: async (parent, {bookData}, context) => {
        if (context.user) {
            await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $push: { savedBooks: bookData } },
            { new: true }
            );
            return post;
        }

        throw new AuthenticationError("You need to be logged in!");
        },


        removeBook: async (parent, { bookId }) => {
            if (context.user) {
                await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: {bookId} } },
                { new: true }
                );
            }
        
            throw new AuthenticationError("You need to be logged in!");
        },
    }
};

module.exports = resolvers;
