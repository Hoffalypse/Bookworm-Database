const { AuthenticationError } = require("apollo-server-express");
const { Book, User  } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context, info ) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  
  Mutation: {
    login: async (parent, { email, password }) => {
      const account = await User.findOne({ email });

      if (!account) {
        throw new AuthenticationError('No account with this email found!');
      }

      const correctPw = await account.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect password!');
      }

      const token = signToken(account);
      return { token, account };
    },
    addUser: async (parent, { username, email, password }) => {
      const account = await Profile.create({ username, email, password });
      const token = signToken(user);

      return { token, account };
    },

    saveBook: async (parent, args, context, info ) => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user },
          {
            $addToSet: { savedBooks: args.input },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async (parent, args, context) => {
      if (context.user) {
        return await Book.findOneAndDelete({savedBooks: { bookId: args.bookId }});
      }
      throw new AuthenticationError('You need to be logged in!');
    },
}
};

module.exports = resolvers;
