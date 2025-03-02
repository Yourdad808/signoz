export type PayloadProps = Record<
	string,
	{
		timestamp: number;
		value: number;
	}
>;
export type Props = {
	timestampStart: number;
	timestampEnd: number;
	step: number;
};
