const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return {
        ...event._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator),
      };
    });
  } catch (err) {
    throw err;
  }
};
const eachEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return {
      ...event._doc,
      _id: event.id,
      creator: user.bind(this, event.creator),
    };
  } catch (error) {
    throw error;
  }
};
const user = async (userId) => {
  try {
  } catch (error) {
    throw error;
  }
  const user = await User.findById(userId);
  return {
    ...user._doc,
    createdEvents: events.bind(this, user._doc.createdEvents),
  };
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();

      return events.map((event) => {
        return {
          ...event._doc,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator),
        };
      });
    } catch (error) {
      throw error;
    }
  },
  bookings: async (args, req) => {
    console.log(req.isAuth)
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    try {
      const bookings = await Booking.find();
      return bookings.map((booking) => {
        return {
          ...booking._doc,
          user: user.bind(this, booking._doc.user),
          event: eachEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString(),
        };
      });
    } catch (error) {
      throw error;
    }
  },
  createEvent: async (args, req) => {
    console.log(req.isAuth)
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date).toISOString(),
      creator: req.userId,
    });
    let createdEvent;
    try {
      const result = await event.save();

      createdEvent = {
        ...result._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator),
      };
      const creator = await User.findById(req.userId);

      if (!creator) {
        throw new Error("user not found");
      } else creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });

      if (existingUser) {
        throw new Error("user already exists");
      }
      const hash = await bcrypt.hash(args.userInput.password, 10);

      const user = new User({
        name: args.userInput.name,
        email: args.userInput.email,
        password: hash,
      });

      const result = await user.save();
      return { ...result._doc, password: null };
    } catch (error) {
      throw error;
    }
  },
  bookEvent: async (args, req) => {
    
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: req.userId,
      event: fetchedEvent,
    });
    const result = await booking.save();
    return {
      ...result._doc,
      user: user.bind(this, booking._doc.user),
      event: eachEvent.bind(this, booking._doc.event),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString(),
    };
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      console.log(booking);
      const event = {
        ...booking.event._doc,
        creator: user.bind(this, booking.event._doc.creator),
      };
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (error) {
      throw error;
    }
  },
  login: async ({ email, password }) => {
    const userFound = await User.findOne({ email: email });
    if (!userFound) {
      throw new Error("User or password is incorrect");
    }
    const passwordMatch = await bcrypt.compare(password, userFound.password);

    if (!passwordMatch) {
      throw new Error("User or password is incorrect");
    }
    const token = jwt.sign(
      { userId: userFound.id, email: userFound.email },
      process.env.token,
      {
        expiresIn: "1h",
      }
    );
    return { userId: userFound.id, token: token, tokenExpTime: 1 };
  },
};
