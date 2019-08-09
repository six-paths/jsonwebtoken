import jwt from 'jsonwebtoken';
import lodashGet from 'lodash/get';

const JWT = {
    token: undefined,
    decode: jwt.decode,
    JsonWebTokenError: jwt.JsonWebTokenError,
    NotBeforeError: jwt.NotBeforeError,
    sign: jwt.sign,
    TokenExpiredError: jwt.TokenExpiredError,
    verify: jwt.verify,

    isValid: (token) => {
        const decodedToken = jwt.decode(token);
        const unixTimestamp = +new Date()/1000;

        return !!(decodedToken &&
            (!decodedToken.iat || decodedToken.iat <= unixTimestamp) &&
            (!decodedToken.exp || decodedToken.exp > unixTimestamp));
    },
    setToken: (token) => {
        JWT.token = token;
    },

    /**
     * JWT getProperty
     *
     * Gets the value of a property, or a specified default value if the property does not exist,
     * from the current token
     *
     * @example JWT.getProperty('iat', +new Date());
     * @example JWT.getProperty('id');
     *
     * @param {string} property
     * @param {mixed} defaultValue
     *
     * @return mixed
     */
    getProperty: (property, defaultValue = null) => {
        const decodedToken = jwt.decode(JWT.token);
        if (decodedToken) {
            return lodashGet(decodedToken, property, defaultValue);
        }

        return defaultValue;
    },

    /**
     * JWT hasRole
     *
     * Determine whether the current token authorises a role, or set of roles. Where an array
     * of roles is defined, all must match in order to satisfy. There is a 'hidden' last parameter,
     * a boolean, that allow for enforcing that all roles must be met across all arguments.
     *
     * User must have the ROLE_ADMINISTRATOR role
     * @example JWT.hasRole('ROLE_ADMINISTRATOR')
     *
     * User must have both the ROLE_ADMINISTRATOR and ROLE_USER roles
     * @example JWT.hasRole(['ROLE_ADMINISTRATOR', 'ROLE_USER'])
     * @example JWT.hasRole('ROLE_ADMINISTRATOR', 'ROLE_USER', true)
     *
     * User must have both the ROLE_ADMINISTRATOR and ROLE_USER roles, OR the ROLE_SUPER_USER role
     * @example JWT.hasRole(['ROLE_ADMINISTRATOR', 'ROLE_USER'], 'ROLE_SUPER_USER')
     *
     * User must have either ROLE_ADMINISTRATOR or ROLE_SUPER_USER
     * @example JWT.hasRole('ROLE_ADMINISTRATOR', 'ROLE_SUPER_USER'[, false])
     *
     * @param {...string|array} rolesToCheck
     * @param {boolean} mustSatisfyAll
     *
     * @return boolean
     */
    hasRole: (...rolesToCheck) => {
        const roles = JWT.getProperty('roles', []);
        const mustSatisfyAll = typeof rolesToCheck[rolesToCheck.length - 1] === 'boolean' ?
            rolesToCheck[rolesToCheck.length - 1] :
            false;
        let result = mustSatisfyAll;

        rolesToCheck.forEach(function(role) {
            // `role` is a string and can be compared directly
            if (typeof role.substring === 'function') {
                result = mustSatisfyAll ?
                    result && roles.indexOf(role) !== -1 :
                    result || roles.indexOf(role) !== -1;
            }

            // `role` is an array and we must therefore recursively loop through its elements
            else if (Array.isArray(role)) {
                result = mustSatisfyAll ?
                    result && JWT.hasRole(...role, true) :
                    result || JWT.hasRole(...role, true);
            }
        });

        return result;
    },
};

export default JWT;
