import history from 'lib/history';
import { parseQuery, reverseParser } from 'lib/logql';
import { isEqual } from 'lodash-es';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'store/reducers';
import {
	SET_SEARCH_QUERY_PARSED_PAYLOAD,
	SET_SEARCH_QUERY_STRING,
} from 'types/actions/logs';
import ILogsReducer from 'types/reducer/logs';

export function useSearchParser() {
	const dispatch = useDispatch();
	const {
		searchFilter: { parsedQuery, queryString },
	} = useSelector<AppState, ILogsReducer>((store) => store.logs);

	const updateQueryString = useCallback(
		(updatedQueryString) => {
			history.push({
				pathname: history.location.pathname,
				search: updatedQueryString ? `?q=${updatedQueryString}` : '',
			});

			dispatch({
				type: SET_SEARCH_QUERY_STRING,
				payload: updatedQueryString,
			});
			const parsedQueryFromString = parseQuery(updatedQueryString);
			if (!isEqual(parsedQuery, parsedQueryFromString)) {
				dispatch({
					type: SET_SEARCH_QUERY_PARSED_PAYLOAD,
					payload: parsedQueryFromString,
				});
			}
		},
		[dispatch, parsedQuery],
	);

	useEffect(() => {
		updateQueryString(queryString);
	}, [queryString, updateQueryString]);

	const updateParsedQuery = useCallback(
		(updatedParsedPayload) => {
			dispatch({
				type: SET_SEARCH_QUERY_PARSED_PAYLOAD,
				payload: updatedParsedPayload,
			});
			const reversedParsedQuery = reverseParser(updatedParsedPayload);
			if (
				!isEqual(queryString, reversedParsedQuery) ||
				(queryString === '' && reversedParsedQuery === '')
			) {
				dispatch({
					type: SET_SEARCH_QUERY_STRING,
					payload: reversedParsedQuery,
				});
			}
		},
		[dispatch, queryString],
	);

	return {
		queryString,
		parsedQuery,
		updateParsedQuery,
		updateQueryString,
	};
}
