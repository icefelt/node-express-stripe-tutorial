# Functionality

This example allows you to:

- Sign up
- Log in and receive a Javascript Web Token (JWT)
- Verify the user is logged in for certain routes
- "Forget" the user's password so a reset link can be "emailed"
- Reset the user's password with a token
- Change the password while the user is logged in

We also use libraries like `@hapi/Joi` and more in this example.

# Create a new project with node

`npm init -y`

# Install dependencies too

- Check `package.json` for more info. 

# Create a new Mongo DB, or use whatever DB you'd like.

You can do so for free using Mongo Atlas.

# Set your environment variables in a file called .env

- `TOKEN_SECRET`, `DB_CONNECT`, etc.

# Credits

- Dev Ed. and others. I'm mostly expanding on their code.