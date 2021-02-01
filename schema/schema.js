const graphql = require('graphql');
const Note = require('../models/note');
const User = require('../models/user');

const {
    GraphQLObjectType, GraphQLString,
    GraphQLID, GraphQLSchema,
    GraphQLList, GraphQLNonNull
} = graphql;

const NoteType = new GraphQLObjectType({
    name: 'Note',

    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        user: {
            type: UserType,
            resolve(parent, args) {
                return User.findById(parent.userID);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        notes: {
            type: new GraphQLList(NoteType),
            resolve(parent, args) {
                return Note.find({ userID: parent.id });
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        note: {
            type: NoteType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Note.findById(args.id);
            }
        },
        notes: {
            type: new GraphQLList(NoteType),
            resolve(parent, args) {
                return Note.find({});
            }
        },
        user: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return User.findById(args.id);
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({});
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                lastName: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args) {
                let user = new User({
                    firstName: args.firstName,
                    lastName: args.lastName,
                    email: args.email,
                    password: args.password,
                });
                return user.save();
            }
        },
        addNote: {
            type: NoteType,
            args: {
                title: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: new GraphQLNonNull(GraphQLString) },
                userID: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                let note = new Note({
                    title: args.title,
                    description: args.description,
                    userID: args.userID
                })
                return note.save()
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});