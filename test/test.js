var assert = require('chai').assert,
    JWT = require('../lib/index').default,
    secret = 'secret';

describe('Is Valid', function()
{
    it('should not allow invalid tokens', function()
    {
        let invalidToken = JWT.sign({}, secret);
        invalidToken = invalidToken.replace(/[a-z]+/g, '_');

        assert.isFalse(JWT.isValid(invalidToken));
    });

    it('should allow valid tokens', function()
    {
        let token = JWT.sign({}, secret);
        assert.isTrue(JWT.isValid(token));
    });

    it('should not allow out of date issuedAt', function()
    {
        let invalidIssuedAtToken = JWT.sign({'iat': ((+new Date) / 1000) + 10}, secret);
        assert.isFalse(JWT.isValid(invalidIssuedAtToken));
    });

    it('should not allow expired tokens', function()
    {
        let expiredToken = JWT.sign({'exp': ((+new Date) / 1000) - 10}, secret);
        assert.isFalse(JWT.isValid(expiredToken));
    });

    it('should allow correctly issued, formatted and unexpired tokens', function()
    {
        let validToken = JWT.sign({'exp': ((+new Date) / 1000) + 10, 'iat': ((+new Date) / 1000) - 10}, secret);
        assert.isTrue(JWT.isValid(validToken));
    });
});


describe('Set Token', function()
{
    it('should set the token', function()
    {
        let token = JWT.sign({}, secret);

        assert.isUndefined(JWT.token);
        JWT.setToken(token);

        assert.equal(JWT.token, token);
    });
});

describe('Get Property', function()
{
    it('should return the default value for undefined properties', function()
    {
        let token = JWT.sign({}, secret);
        assert.isNull(JWT.getProperty('property'));
        assert.equal(JWT.getProperty('property', 123), 123);
    });

    it('should return the property when it exists', function()
    {
        let token = JWT.sign({'property': 123}, secret);
        JWT.setToken(token);
        assert.equal(JWT.getProperty('property'), 123);
    });
});

describe('Has Role', function()
{
    it('should validate that all permissions are required', function()
    {
        let token = JWT.sign({'roles': ['ROLE_ADMINISTRATOR', 'ROLE_USER']}, secret);
        JWT.setToken(token);

        assert.isTrue(JWT.hasRole('ROLE_ADMINISTRATOR', true));
        assert.isTrue(JWT.hasRole('ROLE_ADMINISTRATOR', 'ROLE_USER', true));
        assert.isFalse(JWT.hasRole('ROLE_ADMINISTRATOR', 'ROLE_USER', 'ROLE_DOES_NOT_EXIST', true));
    });

    it('should validate that some permissions are interchangeable', function()
    {
        let token = JWT.sign({'roles': ['ROLE_ADMINISTRATOR', 'ROLE_USER']}, secret);
        JWT.setToken(token);

        assert.isTrue(JWT.hasRole('ROLE_ADMINISTRATOR', 'ROLE_DOES_NOT_EXIST'));
    });

    it('should validate that groups of permissions can be used interchangeably', function()
    {
        let token = JWT.sign({'roles': ['ROLE_ADMINISTRATOR', 'ROLE_USER']}, secret);
        JWT.setToken(token);

        assert.isTrue(JWT.hasRole(['ROLE_ADMINISTRATOR', 'ROLE_USER'], 'ROLE_DOES_NOT_EXIST'));
        assert.isTrue(JWT.hasRole(['ROLE_ADMINISTRATOR', 'ROLE_DOES_NOT_EXIST'], 'ROLE_USER'));
        assert.isFalse(JWT.hasRole(['ROLE_ADMINISTRATOR', 'ROLE_DOES_NOT_EXIST'], 'ROLE_ALSO_DOES_NOT_EXIST'));
        assert.isTrue(JWT.hasRole(['ROLE_ADMINISTRATOR', 'ROLE_DOES_NOT_EXIST'], ['ROLE_ADMINISTRATOR', 'ROLE_USER']));
    });
});
