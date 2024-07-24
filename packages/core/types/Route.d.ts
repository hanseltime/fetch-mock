export default Route;
export type RouteMatcher = import("./Matchers").RouteMatcher;
export type CallLog = import("./CallHistory").CallLog;
export type RouteMatcherFunction = import("./Matchers").RouteMatcherFunction;
export type RouteMatcherUrl = import("./Matchers").RouteMatcherUrl;
export type MatcherDefinition = import("./Matchers").MatcherDefinition;
export type FetchMockGlobalConfig = import("./FetchMock").FetchMockGlobalConfig;
export type FetchImplementations = import("./FetchMock").FetchImplementations;
export type UserRouteConfig = {
    name?: RouteName;
    method?: string;
    headers?: {
        [key: string]: string | number;
    };
    query?: {
        [key: string]: string;
    };
    params?: {
        [key: string]: string;
    };
    body?: object;
    matcherFunction?: RouteMatcherFunction;
    matcher?: RouteMatcher;
    url?: RouteMatcherUrl;
    response?: RouteResponse | RouteResponseFunction;
    repeat?: number;
    delay?: number;
    sticky?: boolean;
    isFallback?: boolean;
};
export type InternalRouteConfig = {
    usesBody?: boolean;
};
export type ExtendedUserRouteConfig = UserRouteConfig & FetchMockGlobalConfig;
export type RouteConfig = ExtendedUserRouteConfig & FetchImplementations & InternalRouteConfig;
export type RouteResponseConfig = {
    body?: string | {};
    status?: number;
    headers?: {
        [key: string]: string;
    };
    throws?: Error;
    redirectUrl?: string;
    options?: ResponseInit;
};
export type ResponseInitUsingHeaders = {
    status: number;
    statusText: string;
    headers: Headers;
};
export type RouteResponseObjectData = RouteResponseConfig | object;
export type RouteResponseData = Response | number | string | RouteResponseObjectData;
export type RouteResponsePromise = Promise<RouteResponseData>;
export type RouteResponseFunction = (arg0: CallLog) => (RouteResponseData | RouteResponsePromise);
export type RouteResponse = RouteResponseData | RouteResponsePromise | RouteResponseFunction;
export type RouteName = string;
declare class Route {
    static defineMatcher(matcher: MatcherDefinition): void;
    static registeredMatchers: MatcherDefinition[];
    constructor(config: RouteConfig);
    config: RouteConfig;
    matcher: RouteMatcherFunction | undefined;
    reset(): void;
    constructResponse(responseInput: RouteResponseConfig): {
        response: Response;
        responseOptions: ResponseInit;
        responseInput: RouteResponseConfig;
    };
    constructResponseOptions(responseInput: RouteResponseConfig): ResponseInitUsingHeaders;
    constructResponseBody(responseInput: RouteResponseConfig, responseOptions: ResponseInitUsingHeaders): string | null;
    #private;
}
