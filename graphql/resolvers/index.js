const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const events = (eventIds) => {
  return Event.find({ _id: { $in: eventIds } })
    .then((events) => {
      return events.map((event) => {
        return { ...event._doc, creator: user.bind(this, event.creator) };
      });
    })
    .catch((err) => {
      throw err;
    });
};

const user = (userId) => {
  return User.findById(userId)
    .then((user) => {
      return {
        ...user._doc,
        createdEvents: events.bind(this, user._doc.createdEvents),
      };
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
};
module.exports = {
  events: () => {
    return Event.find()
      .then((events) => {
        // console.log(events);
        return events.map((event) => {
          // console.log("asdasd"+ event)
          return {
            ...event._doc,
            creator: user.bind(this, event._doc.creator),
          };
        });
      })
      .catch((err) => {
        throw err;
      });
    // return events;
  },
  createEvent: (args) => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date).toISOString(),
      creator: "609f71bb0a7dc73a34e52ac1",
    });
    let createdEvent;
    return event
      .save()
      .then((result) => {
        createdEvent = {
          ...result._doc,
          creator: user.bind(this, result._doc.creator),
        };
        return User.findById("609f71bb0a7dc73a34e52ac1");
        // console.log(result);
      })
      .then((user) => {
        if (!user) {
          throw new Error("user not found");
        } else user.createdEvents.push(event);
        return user.save();
      })
      .then((result) => {
        return createdEvent;
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  },
  createUser: (args) => {
    return User.findOne({ email: args.userInput.email })
      .then((user) => {
        if (user) {
          throw new Error("user already exists");
        } else {
          return bcrypt.hash(args.userInput.password, 10);
        }
      })
      .then((hash) => {
        const user = new User({
          name: args.userInput.name,
          email: args.userInput.email,
          password: hash,
        });
        return user.save();
      })
      .then((result) => {
        return { ...result._doc, password: null };
      })
      .catch((error) => {
        throw error;
      });
  },
};
