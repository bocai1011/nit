import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';

const ReferenceData = {
    _buildPath: function(secId, endPoint) {
        if (endPoint === undefined) {
            endPoint = '';
        }
        return ('/case/' + NeatApp.caseName() + '/security/' + secId + endPoint);
    },

    get: function(security_oid) {
        return util.get(this._buildPath(security_oid, '/reference_data'));
    },

    set: function(security_oid, security) {
        return util.post(this._buildPath(security_oid), security);
    },

    setCollection: function(security_oids, data) {
        return util.post('/case/' + NeatApp.caseName() + '/security', {
            oids: security_oids,
            data: data
        });
    },

    getValidation: function(security_oids) {
        return util.get('/case/' + NeatApp.caseName() + '/security/validation',
            undefined, undefined, undefined, {osec: security_oids});
    },

    getPricing: function(security_oid, ref_security_oid) {
        return util.get(this._buildPath(security_oid, '/reference_pricing'),
            undefined, undefined, undefined, {rsec: ref_security_oid});
    },

    getRDOs: function(security_oid, params) {
        return util.get(this._buildPath(security_oid, '/rdos'),
            undefined, undefined, undefined, params);
    }
};

export default ReferenceData;
