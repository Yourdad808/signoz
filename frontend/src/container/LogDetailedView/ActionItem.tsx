import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Col, Popover } from 'antd';
import getStep from 'lib/getStep';
import { generateFilterQuery } from 'lib/logs/generateFilterQuery';
import React, { Dispatch, memo, useCallback, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { getLogs } from 'store/actions/logs/getLogs';
import { getLogsAggregate } from 'store/actions/logs/getLogsAggregate';
import { AppState } from 'store/reducers';
import AppActions from 'types/actions';
import { SET_SEARCH_QUERY_STRING, TOGGLE_LIVE_TAIL } from 'types/actions/logs';
import { GlobalReducer } from 'types/reducer/globalTime';
import ILogsReducer from 'types/reducer/logs';

const removeJSONStringifyQuotes = (s: string) => {
	if (!s || !s.length) {
		return s;
	}

	if (s[0] === '"' && s[s.length - 1] === '"') {
		return s.slice(1, s.length - 1);
	}
	return s;
};
function ActionItem({ fieldKey, fieldValue, getLogs, getLogsAggregate }) {
	const {
		searchFilter: { queryString },
		logLinesPerPage,
		idStart,
		liveTail,
		idEnd,
	} = useSelector<AppState, ILogsReducer>((store) => store.logs);
	const dispatch = useDispatch();

	const { maxTime, minTime } = useSelector<AppState, GlobalReducer>(
		(state) => state.globalTime,
	);

	const handleQueryAdd = (newQueryString) => {
		let updatedQueryString = queryString || '';

		if (updatedQueryString.length === 0) {
			updatedQueryString += `${newQueryString}`;
		} else {
			updatedQueryString += ` AND ${newQueryString}`;
		}
		dispatch({
			type: SET_SEARCH_QUERY_STRING,
			payload: updatedQueryString,
		});

		if (liveTail === 'STOPPED') {
			getLogs({
				q: updatedQueryString,
				limit: logLinesPerPage,
				orderBy: 'timestamp',
				order: 'desc',
				timestampStart: minTime,
				timestampEnd: maxTime,
				...(idStart ? { idGt: idStart } : {}),
				...(idEnd ? { idLt: idEnd } : {}),
			});
			getLogsAggregate({
				timestampStart: minTime,
				timestampEnd: maxTime,
				step: getStep({
					start: minTime,
					end: maxTime,
					inputFormat: 'ns',
				}),
				q: updatedQueryString,
			});
		} else if (liveTail === 'PLAYING') {
			dispatch({
				type: TOGGLE_LIVE_TAIL,
				payload: 'PAUSED',
			});
			setTimeout(
				() =>
					dispatch({
						type: TOGGLE_LIVE_TAIL,
						payload: liveTail,
					}),
				0,
			);
		}
	};
	const validatedFieldValue = removeJSONStringifyQuotes(fieldValue);
	const PopOverMenuContent = useMemo(
		() => (
			<Col>
				<Button
					type="text"
					size="small"
					onClick={() =>
						handleQueryAdd(
							generateFilterQuery({
								fieldKey,
								fieldValue: validatedFieldValue,
								type: 'IN',
							}),
						)
					}
				>
					<PlusCircleOutlined /> Filter for value
				</Button>
				<br />
				<Button
					type="text"
					size="small"
					onClick={() =>
						handleQueryAdd(
							generateFilterQuery({
								fieldKey,
								fieldValue: validatedFieldValue,
								type: 'NIN',
							}),
						)
					}
				>
					<MinusCircleOutlined /> Filter out value
				</Button>
			</Col>
		),
		[],
	);
	return (
		<Popover placement="bottomLeft" content={PopOverMenuContent} trigger="click">
			<Button type="text" size="small">
				...
			</Button>
		</Popover>
	);
}

interface DispatchProps {
	getLogs: () => (dispatch: Dispatch<AppActions>) => void;
	getLogsAggregate: () => (dispatch: Dispatch<AppActions>) => void;
}

const mapDispatchToProps = (
	dispatch: ThunkDispatch<unknown, unknown, AppActions>,
): DispatchProps => ({
	getLogs: bindActionCreators(getLogs, dispatch),
	getLogsAggregate: bindActionCreators(getLogsAggregate, dispatch),
});

export default connect(null, mapDispatchToProps)(memo(ActionItem));
