import svgs from 'virtual:svg-ts';
import type { SvgName } from 'virtual:svg-ts';

interface Props {
	name: SvgName;
}

export function Icon({ name }: Props) {
	const Svg = svgs[name];
	return (
		<span>
			<Svg />
		</span>
	);
}
