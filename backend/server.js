const allowedOrigins = [
  "https://familycrackersworld.com",
  "https://www.familycrackersworld.com",
  "https://familycrackersworld-fwc.netlify.app",
  "http://familycrackersworld.com",
  "http://www.familycrackersworld.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

// Explicitly handle preflight requests
app.options("*", cors());