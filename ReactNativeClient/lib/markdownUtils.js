const stringPadding = require('string-padding');
const urlUtils = require('lib/urlUtils');
const MarkdownIt = require('markdown-it');

const markdownUtils = {

	// Not really escaping because that's not supported by marked.js
	escapeLinkText(text) {
		return text.replace(/(\[|\]|\(|\))/g, '_');
	},

	escapeLinkUrl(url) {
		url = url.replace(/\(/g, '%28');
		url = url.replace(/\)/g, '%29');
		return url;
	},

	prependBaseUrl(md, baseUrl) {
		return md.replace(/(\]\()([^\s\)]+)(.*?\))/g, (match, before, url, after) => {
			return before + urlUtils.prependBaseUrl(url, baseUrl) + after;
		});
	},

	extractImageUrls(md) {
		const markdownIt = new MarkdownIt();
		const env = {};
		const tokens = markdownIt.parse(md, env);
		const output = [];

		const searchUrls = (tokens) => {
			for (let i = 0; i < tokens.length; i++) {
				const token = tokens[i];

				if (token.type === 'image') {
					for (let j = 0; j < token.attrs.length; j++) {
						const a = token.attrs[j];
						if (a[0] === 'src' && a.length >= 2 && a[1]) {
							output.push(a[1]);
						}
					}
				}
				
				if (token.children && token.children.length) {
					searchUrls(token.children);
				}
			}
		}

		searchUrls(tokens);

		return output;
	},

	olLineNumber(line) {
		const match = line.match(/^(\d+)\.(\s.*|)$/);
		return match ? Number(match[1]) : 0;
	},

	createMarkdownTable(headers, rows) {
		let output = [];

		const headersMd = [];
		const lineMd = [];
		for (let i = 0; i < headers.length; i++) {
			const mdRow = [];
			const h = headers[i];
			headersMd.push(stringPadding(h.label, 3, ' ', stringPadding.RIGHT));
			lineMd.push('---');
		}

		output.push(headersMd.join(' | '));
		output.push(lineMd.join(' | '));

		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			const rowMd = [];
			for (let j = 0; j < headers.length; j++) {
				const h = headers[j];
				const value = h.filter ? h.filter(row[h.name]) : row[h.name];
				rowMd.push(stringPadding(value, 3, ' ', stringPadding.RIGHT));
			}
			output.push(rowMd.join(' | '));
		}

		return output.join('\n');
	},

	createHtmlToc(markdown) {
		if (!this.createHtmlTocParser_) {
			// TODO: Check options
			// TODO: is markdown-it-anchor needed?
			// TODO: add require() on top of file
			this.createHtmlTocParser_ = require("markdown-it")({
				html: false,
				xhtmlOut: true,
				typographer: true
			});
			this.createHtmlTocParser_.use(require("markdown-it-anchor"), { permalink: true, permalinkBefore: true, permalinkSymbol: '§' })
			this.createHtmlTocParser_.use(require("markdown-it-toc-done-right"));
		}

		// markdown-it is going to return the complete HTML document, but we only want the TOC
		// so wrap the token with globally unique markers, and extract the HTML TOC once the
		// document has been parsed.

		const marker = '2A4C045DAAD24A99B82F17AF2DDD2849';
		let result = this.createHtmlTocParser_.render(marker + '\n${toc}\n' + marker + '\n' + markdown);
		let tocHtml = result.split(marker)[1];
		return tocHtml;
	},

};

module.exports = markdownUtils;