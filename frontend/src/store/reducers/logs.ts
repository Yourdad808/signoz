import { parseQuery } from 'lib/logql';
import {
	ADD_SEARCH_FIELD_QUERY_STRING,
	FLUSH_LOGS,
	GET_FIELDS,
	GET_NEXT_LOG_LINES,
	GET_PREVIOUS_LOG_LINES,
	LogsActions,
	PUSH_LIVE_TAIL_EVENT,
	RESET_ID_START_AND_END,
	SET_DETAILED_LOG_DATA,
	SET_FIELDS,
	SET_LIVE_TAIL_START_TIME,
	SET_LOADING,
	SET_LOADING_AGGREGATE,
	SET_LOG_LINES_PER_PAGE,
	SET_LOGS,
	SET_LOGS_AGGREGATE_SERIES,
	SET_SEARCH_QUERY_PARSED_PAYLOAD,
	SET_SEARCH_QUERY_STRING,
	STOP_LIVE_TAIL,
	TOGGLE_LIVE_TAIL,
} from 'types/actions/logs';
import ILogsReducer from 'types/reducer/logs';

const initialState: ILogsReducer = {
	fields: {
		interesting: [],
		selected: [],
	},
	searchFilter: {
		queryString: '',
		parsedQuery: [],
	},
	logs: [],
	logLinesPerPage: 25,
	idEnd: '',
	idStart: '',
	isLoading: false,
	isLoadingAggregate: false,
	logsAggregate: [],
	detailedLog: null,
	liveTail: 'STOPPED',
	liveTailStartRange: 15,
	// detailedLog: {
	// 	timestamp: 1659360016955270100,
	// 	id: '2CkBCauK8m3nkyKR19YhCw6WfvD',
	// 	traceId: '',
	// 	spanId: '',
	// 	traceFlags: 0,
	// 	severityText: '',
	// 	severityNumber: 0,
	// 	body:
	// 		'49.207.215.17 - - [01/Aug/2022:13:20:16 +0000] "OPTIONS /api/v1/logs/fields HTTP/1.1" 200 23 "http://localhost:3301/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36" "-"\n',
	// 	resourcesString: {
	// 		source: 'docker',
	// 	},
	// 	attributesString: {
	// 		container_id:
	// 			'b3c6808322609f7671c18a09515d9c84909c873471b560da65c1afe0dfd933ea',
	// 		log_file_path:
	// 			'/var/lib/docker/containers/b3c6808322609f7671c18a09515d9c84909c873471b560da65c1afe0dfd933ea/b3c6808322609f7671c18a09515d9c84909c873471b560da65c1afe0dfd933ea-json.log',
	// 		stream: 'stdout',
	// 		time: '2022-08-01T13:20:16.955270245Z',
	// 	},
	// 	attributesInt: {},
	// 	attributesFloat: {},
	// },
};

export const LogsReducer = (
	state = initialState,
	action: LogsActions,
): ILogsReducer => {
	switch (action.type) {
		case SET_LOADING: {
			return {
				...state,
				isLoading: action.payload,
			};
		}

		case SET_LOADING_AGGREGATE: {
			return {
				...state,
				isLoadingAggregate: action.payload,
			};
		}

		case GET_FIELDS:
			return {
				...state,
			};

		case SET_FIELDS: {
			const newFields = action.payload;

			return {
				...state,
				fields: newFields,
			};
		}

		case SET_SEARCH_QUERY_STRING: {
			return {
				...state,
				searchFilter: {
					...state.searchFilter,
					queryString: action.payload,
				},
			};
		}

		case SET_SEARCH_QUERY_PARSED_PAYLOAD: {
			return {
				...state,
				searchFilter: {
					...state.searchFilter,
					parsedQuery: action.payload,
				},
			};
		}

		case ADD_SEARCH_FIELD_QUERY_STRING: {
			const updatedQueryString =
				state.searchFilter.queryString +
				(state.searchFilter.queryString.length > 0 ? ' and ' : '') +
				action.payload;

			const updatedParsedQuery = parseQuery(updatedQueryString);
			return {
				...state,
				searchFilter: {
					...state.searchFilter,
					queryString: updatedQueryString,
					parsedQuery: updatedParsedQuery,
				},
			};
		}

		case SET_LOGS: {
			const logsData = action.payload;
			return {
				...state,
				logs: logsData,
			};
		}
		case SET_LOG_LINES_PER_PAGE: {
			return {
				...state,
				logLinesPerPage: action.payload,
			};
		}

		case GET_PREVIOUS_LOG_LINES: {
			const idStart = state.logs.length > 0 ? state.logs[0].id : '';
			return {
				...state,
				idStart,
				idEnd: '',
			};
		}

		case GET_NEXT_LOG_LINES: {
			const idEnd =
				state.logs.length > 0 ? state.logs[state.logs.length - 1].id : '';
			return {
				...state,
				idStart: '',
				idEnd,
			};
		}

		case RESET_ID_START_AND_END: {
			return {
				...state,
				idEnd: '',
				idStart: '',
			};
		}

		case SET_LOGS_AGGREGATE_SERIES: {
			return {
				...state,
				logsAggregate: action.payload,
			};
		}

		case SET_DETAILED_LOG_DATA: {
			return {
				...state,
				detailedLog: action.payload,
			};
		}

		case TOGGLE_LIVE_TAIL: {
			return {
				...state,
				liveTail: action.payload,
			};
		}
		case STOP_LIVE_TAIL: {
			return {
				...state,
				logs: [],
				liveTail: 'STOPPED',
			};
		}
		case PUSH_LIVE_TAIL_EVENT: {
			return {
				...state,
				logs: action.payload.concat(state.logs).slice(0, 100),
			};
		}
		case SET_LIVE_TAIL_START_TIME: {
			return {
				...state,
				liveTailStartRange: action.payload,
			};
		}
		case FLUSH_LOGS: {
			return {
				...state,
				logs: [],
			};
		}

		default:
			return state;
	}
};

export default LogsReducer;
