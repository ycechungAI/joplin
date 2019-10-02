import * as Koa from 'koa';
import { ErrorNotFound, ErrorMethodNotAllowed } from '../utils/errors';
import { SubPath, Route, ApiResponseType, ApiResponse } from '../utils/routeUtils';

const route:Route = {

	exec: async function(path:SubPath, ctx:Koa.Context) {

		if (!path.link) {
			if (ctx.method === 'GET') {
				const koaResponse = ctx.response;
				koaResponse.body = 'TESTING';
				koaResponse.set('Content-Type', 'text/html');
				//koaResponse.set('Content-Length', file.size.toString());
				return new ApiResponse(ApiResponseType.KoaResponse, koaResponse);
			}

			throw new ErrorMethodNotAllowed();
		}

		throw new ErrorNotFound(`Invalid link: ${path.link}`);
	},

	//needsBodyMiddleware: true,

};

export default route;
