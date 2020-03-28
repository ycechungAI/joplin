// const Entities = require('html-entities').AllHtmlEntities;
// const htmlentities = new Entities().encode;

// Imported from models/Resource.js
const FetchStatuses = {
	FETCH_STATUS_IDLE: 0,
	FETCH_STATUS_STARTED: 1,
	FETCH_STATUS_DONE: 2,
	FETCH_STATUS_ERROR: 3,
};

const utils = {};

utils.getAttr = function(attrs, name, defaultValue = null) {
	for (let i = 0; i < attrs.length; i++) {
		if (attrs[i][0] === name) return attrs[i].length > 1 ? attrs[i][1] : null;
	}
	return defaultValue;
};

utils.notDownloadedResource = function() {
	return `
		<svg width="1700" height="1536" xmlns="http://www.w3.org/2000/svg">
		    <path d="M1280 1344c0-35-29-64-64-64s-64 29-64 64 29 64 64 64 64-29 64-64zm256 0c0-35-29-64-64-64s-64 29-64 64 29 64 64 64 64-29 64-64zm128-224v320c0 53-43 96-96 96H96c-53 0-96-43-96-96v-320c0-53 43-96 96-96h465l135 136c37 36 85 56 136 56s99-20 136-56l136-136h464c53 0 96 43 96 96zm-325-569c10 24 5 52-14 70l-448 448c-12 13-29 19-45 19s-33-6-45-19L339 621c-19-18-24-46-14-70 10-23 33-39 59-39h256V64c0-35 29-64 64-64h256c35 0 64 29 64 64v448h256c26 0 49 16 59 39z"/>
		</svg>
	`;
};

utils.errorImage = function() {
	// https://github.com/ForkAwesome/Fork-Awesome/blob/master/src/icons/svg/times-circle.svg
	return `
		<svg width="1795" height="1795" xmlns="http://www.w3.org/2000/svg">
		    <path d="M1149 1122c0-17-7-33-19-45L949 896l181-181c12-12 19-28 19-45s-7-34-19-46l-90-90c-12-12-29-19-46-19s-33 7-45 19L768 715 587 534c-12-12-28-19-45-19s-34 7-46 19l-90 90c-12 12-19 29-19 46s7 33 19 45l181 181-181 181c-12 12-19 28-19 45s7 34 19 46l90 90c12 12 29 19 46 19s33-7 45-19l181-181 181 181c12 12 28 19 45 19s34-7 46-19l90-90c12-12 19-29 19-46zm387-226c0 424-344 768-768 768S0 1320 0 896s344-768 768-768 768 344 768 768z"/>
		</svg>
	`;
};

utils.loaderImage = function() {
	// https://github.com/ForkAwesome/Fork-Awesome/blob/master/src/icons/svg/hourglass-half.svg
	return `
		<svg width="1536" height="1790" xmlns="http://www.w3.org/2000/svg">
    		<path d="M1408 128c0 370-177 638-373 768 196 130 373 398 373 768h96c18 0 32 14 32 32v64c0 18-14 32-32 32H32c-18 0-32-14-32-32v-64c0-18 14-32 32-32h96c0-370 177-638 373-768-196-130-373-398-373-768H32c-18 0-32-14-32-32V32C0 14 14 0 32 0h1472c18 0 32 14 32 32v64c0 18-14 32-32 32h-96zm-128 0H256c0 146 33 275 85 384h854c52-109 85-238 85-384zm-57 1216c-74-193-207-330-340-384H653c-133 54-266 191-340 384h910z"/>
		</svg>
	`;
};

utils.resourceStatusImage = function(state) {
	if (state === 'notDownloaded') return utils.notDownloadedResource();
	return utils.resourceStatusFile(state);
};

utils.resourceStatusFile = function(state) {
	if (state === 'notDownloaded') return utils.notDownloadedResource();
	if (state === 'downloading') return utils.loaderImage();
	if (state === 'encrypted') return utils.loaderImage();
	if (state === 'error') return utils.errorImage();

	throw new Error(`Unknown state: ${state}`);
};

utils.resourceStatusIcon = function(state) {
	if (state === 'notDownloaded') return 'fa-cloud-download';
	if (state === 'downloading') return 'fa-hourglass-half';
	if (state === 'encrypted') return 'fa-hourglass-half';
	if (state === 'error') return 'fa-times-circle';

	throw new Error(`Unknown state: ${state}`);
};

utils.resourceStatus = function(ResourceModel, resourceInfo) {
	if (!ResourceModel) return 'ready';

	let resourceStatus = 'ready';

	if (resourceInfo) {
		const resource = resourceInfo.item;
		const localState = resourceInfo.localState;

		if (localState.fetch_status === FetchStatuses.FETCH_STATUS_IDLE) {
			resourceStatus = 'notDownloaded';
		} else if (localState.fetch_status === FetchStatuses.FETCH_STATUS_STARTED) {
			resourceStatus = 'downloading';
		} else if (localState.fetch_status === FetchStatuses.FETCH_STATUS_DONE) {
			if (resource.encryption_blob_encrypted || resource.encryption_applied) {
				resourceStatus = 'encrypted';
			}
		}
	} else {
		resourceStatus = 'notDownloaded';
	}

	return resourceStatus;
};

utils.imageReplacement = function(ResourceModel, src, resources, resourceBaseUrl) {
	if (!ResourceModel) return null;

	if (!ResourceModel.isResourceUrl(src)) return null;

	const resourceId = ResourceModel.urlToId(src);
	const result = resources[resourceId];
	const resource = result ? result.item : null;
	const resourceStatus = utils.resourceStatus(ResourceModel, result);

	if (resourceStatus !== 'ready') {
		// const icon = utils.resourceStatusImage(resourceStatus);
		// return `<div class="mceNonEditable not-loaded-resource resource-status-${resourceStatus}" data-resource-id="${resourceId}">` + `<img src="data:image/svg+xml;utf8,${htmlentities(icon)}"/>` + '</div>';
		return `<div class="mceNonEditable not-loaded-resource resource-status-${resourceStatus}" data-resource-id="${resourceId}">` + `<i class="fa ${utils.resourceStatusIcon(resourceStatus)}"></i>` + '</div>';
	}

	const mime = resource.mime ? resource.mime.toLowerCase() : '';
	if (ResourceModel.isSupportedImageMimeType(mime)) {
		let newSrc = `./${ResourceModel.filename(resource)}`;
		if (resourceBaseUrl) newSrc = resourceBaseUrl + newSrc;
		return {
			'data-resource-id': resource.id,
			src: newSrc,
		};
	}

	return null;
};

module.exports = utils;
