export type TeamRuleMarkdownBlock =
	| {
			id: string;
			level: number;
			text: string;
			type: "heading";
	  }
	| {
			id: string;
			items: TeamRuleMarkdownListItem[];
			type: "list";
	  }
	| {
			id: string;
			text: string;
			type: "paragraph";
	  };

export interface TeamRuleMarkdownListItem {
	children: TeamRuleMarkdownListItem[];
	id: string;
	text: string;
}

export type TeamRuleInlinePart =
	| {
			type: "code";
			value: string;
	  }
	| {
			type: "text";
			value: string;
	  };

interface MarkdownLine {
	raw: string;
	sourceIndex: number;
}

const headingPattern = /^(#{1,6})\s+(.+)$/;
const unorderedListPattern = /^(\s*)[-*]\s+(.+)$/;
const inlineCodePattern = /(`[^`]+`)/g;

export function parseTeamRuleMarkdown(
	markdown: string,
): TeamRuleMarkdownBlock[] {
	const lines = markdown
		.replace(/\r\n/g, "\n")
		.split("\n")
		.map((raw, sourceIndex) => ({ raw, sourceIndex }));
	const blocks: TeamRuleMarkdownBlock[] = [];
	let lineIndex = 0;

	while (lineIndex < lines.length) {
		const line = lines[lineIndex];
		const trimmedLine = line.raw.trim();

		if (!trimmedLine) {
			lineIndex += 1;
			continue;
		}

		const headingMatch = trimmedLine.match(headingPattern);

		if (headingMatch) {
			blocks.push({
				id: `heading-${line.sourceIndex}`,
				level: headingMatch[1].length,
				text: headingMatch[2],
				type: "heading",
			});
			lineIndex += 1;
			continue;
		}

		const listMatch = line.raw.match(unorderedListPattern);

		if (listMatch) {
			const { items, nextIndex } = parseList(lines, lineIndex, getIndent(line));

			blocks.push({
				id: `list-${line.sourceIndex}`,
				items,
				type: "list",
			});
			lineIndex = nextIndex;
			continue;
		}

		const { nextIndex, text } = parseParagraph(lines, lineIndex);
		blocks.push({
			id: `paragraph-${line.sourceIndex}`,
			text,
			type: "paragraph",
		});
		lineIndex = nextIndex;
	}

	return blocks;
}

export function parseTeamRuleInlineCode(text: string): TeamRuleInlinePart[] {
	return text
		.split(inlineCodePattern)
		.filter(Boolean)
		.map((part) => {
			if (part.startsWith("`") && part.endsWith("`")) {
				return {
					type: "code",
					value: part.slice(1, -1),
				};
			}

			return {
				type: "text",
				value: part,
			};
		});
}

function parseList(
	lines: MarkdownLine[],
	startIndex: number,
	baseIndent: number,
): {
	items: TeamRuleMarkdownListItem[];
	nextIndex: number;
} {
	const items: TeamRuleMarkdownListItem[] = [];
	let lineIndex = startIndex;

	while (lineIndex < lines.length) {
		const line = lines[lineIndex];
		const listMatch = line.raw.match(unorderedListPattern);

		if (!listMatch) {
			break;
		}

		const indent = getIndent(line);

		if (indent < baseIndent) {
			break;
		}

		if (indent > baseIndent) {
			if (!items.length) {
				break;
			}

			const nestedList = parseList(lines, lineIndex, indent);
			items[items.length - 1].children.push(...nestedList.items);
			lineIndex = nestedList.nextIndex;
			continue;
		}

		items.push({
			children: [],
			id: `item-${line.sourceIndex}`,
			text: listMatch[2],
		});
		lineIndex += 1;
	}

	return { items, nextIndex: lineIndex };
}

function parseParagraph(
	lines: MarkdownLine[],
	startIndex: number,
): {
	nextIndex: number;
	text: string;
} {
	const paragraphLines: string[] = [];
	let lineIndex = startIndex;

	while (lineIndex < lines.length) {
		const line = lines[lineIndex];
		const trimmedLine = line.raw.trim();

		if (
			!trimmedLine ||
			headingPattern.test(trimmedLine) ||
			unorderedListPattern.test(line.raw)
		) {
			break;
		}

		paragraphLines.push(trimmedLine);
		lineIndex += 1;
	}

	return {
		nextIndex: lineIndex,
		text: paragraphLines.join(" "),
	};
}

function getIndent(line: MarkdownLine) {
	const indentMatch = line.raw.match(/^(\s*)/);
	return indentMatch?.[1].replace(/\t/g, "  ").length ?? 0;
}
