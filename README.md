
# JSON Web Token

## Installation

Add the following to your packages.json file

    "@six-paths/jsonwebtoken": "github:six-paths/jsonwebtoken#0.0.1"

## Usage

    import JWT from '@six-paths/jsonwebtoken';

### Token Validation

    JWT.isValid(<token>);

### Setting Token

    JWT.setToken(<token>);

### Getting Properties

    JWT.getProperty(<property>, <defaultValue | null>);

### Determine Roles

    JWT.hasRole('ROLE_ADMINISTRATOR');

## Running Tests

    npm install # Install dependencies
    npm run build # Build module
    npm test # Run tests
