# How Authentication Works

To ensure validity of the response, use either
- Server-side Sessions (more ideal for tightly-coupled front/back end)
  - Store unique identifier on server
  - Send same to client
  - Client sends identifier with future requests
- Authentication tokens (more ideal for React Apps)
  - After user authenticated with creds, server creates a token
  - Server sends same to client
  - Client sends token on future requests
  - Server asks:  Would I be able to rebuild this token (jwt.verify) based on the private key that I know?
      - If so, permission is granted
  - Each protected route sends the token to the back end to a common function to verify (middleware)

# Notes
- Max React auth section points to React for authentication
1. The React part of React course relies on its earlier routing section
2. The back end auth relies on Max Node course