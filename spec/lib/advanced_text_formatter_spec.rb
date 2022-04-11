require 'rails_helper'

RSpec.describe AdvancedTextFormatter do
  describe '#to_s' do
    let(:preloaded_accounts) { nil }
    let(:content_type) { 'text/markdown' }

    subject { described_class.new(text, preloaded_accounts: preloaded_accounts, content_type: content_type).to_s }

    context 'given a markdown source' do
      let(:content_type) { 'text/markdown' }

      context 'given text containing plain text' do
        let(:text) { 'text' }

        it 'paragraphizes the text' do
          is_expected.to eq '<p>text</p>'
        end
      end

      context 'given text containing line feeds' do
        let(:text) { "line\nfeed" }

        it 'removes line feeds' do
          is_expected.not_to include "\n"
        end
      end

      context 'given some inline code using backticks' do
        let(:text) { 'test `foo` bar' }

        it 'formats code using <code>' do
          is_expected.to include 'test <code>foo</code> bar'
        end
      end

      context 'given a block code' do
        let(:text) { "test\n\n```\nint main(void) {\n  return 0;\n}\n```\n" }

        it 'formats code using <pre> and <code>' do
          is_expected.to include '<pre><code>int main'
        end
      end

      context 'given some quote' do
        let(:text) { "> foo\n\nbar" }

        it 'formats code using <code>' do
          is_expected.to include '<blockquote><p>foo</p></blockquote>'
        end
      end

      context 'given text with a local-domain mention' do
        let(:text) { 'foo https://cb6e6126.ngrok.io/about/more' }

        it 'creates a link' do
          is_expected.to include '<a href="https://cb6e6126.ngrok.io/about/more"'
        end
      end

      context 'given text containing linkable mentions' do
        let(:preloaded_accounts) { [Fabricate(:account, username: 'alice')] }
        let(:text) { '@alice' }

        it 'creates a mention link' do
          is_expected.to include '<a href="https://cb6e6126.ngrok.io/@alice" class="u-url mention">@<span>alice</span></a></span>'
        end
      end

      context 'given text containing unlinkable mentions' do
        let(:preloaded_accounts) { [] }
        let(:text) { '@alice' }

        it 'does not create a mention link' do
          is_expected.to include '@alice'
        end
      end

      context 'given a stand-alone medium URL' do
        let(:text) { 'https://hackernoon.com/the-power-to-build-communities-a-response-to-mark-zuckerberg-3f2cac9148a4' }

        it 'matches the full URL' do
          is_expected.to include 'href="https://hackernoon.com/the-power-to-build-communities-a-response-to-mark-zuckerberg-3f2cac9148a4"'
        end
      end

      context 'given a stand-alone google URL' do
        let(:text) { 'http://google.com' }

        it 'matches the full URL' do
          is_expected.to include 'href="http://google.com"'
        end
      end

      context 'given a stand-alone URL with a newer TLD' do
        let(:text) { 'http://example.gay' }

        it 'matches the full URL' do
          is_expected.to include 'href="http://example.gay"'
        end
      end

      context 'given a stand-alone IDN URL' do
        let(:text) { 'https://nic.みんな/' }

        it 'matches the full URL' do
          is_expected.to include 'href="https://nic.みんな/"'
        end

        it 'has display URL' do
          is_expected.to include '<span class="">nic.みんな/</span>'
        end
      end

      context 'given a URL with a trailing period' do
        let(:text) { 'http://www.mcmansionhell.com/post/156408871451/50-states-of-mcmansion-hell-scottsdale-arizona. ' }

        it 'matches the full URL but not the period' do
          is_expected.to include 'href="http://www.mcmansionhell.com/post/156408871451/50-states-of-mcmansion-hell-scottsdale-arizona"'
        end
      end

      context 'given a URL enclosed with parentheses' do
        let(:text) { '(http://google.com/)' }

        it 'matches the full URL but not the parentheses' do
          is_expected.to include 'href="http://google.com/"'
        end
      end

      context 'given a URL with a trailing exclamation point' do
        let(:text) { 'http://www.google.com!' }

        it 'matches the full URL but not the exclamation point' do
          is_expected.to include 'href="http://www.google.com"'
        end
      end

      context 'given a URL with a trailing single quote' do
        let(:text) { "http://www.google.com'" }

        it 'matches the full URL but not the single quote' do
          is_expected.to include 'href="http://www.google.com"'
        end
      end
    end

    context 'given a URL with a trailing angle bracket' do
      let(:text) { 'http://www.google.com>' }

      it 'matches the full URL but not the angle bracket' do
        is_expected.to include 'href="http://www.google.com"'
      end
    end

    context 'given a URL with a query string' do
      context 'with escaped unicode character' do
        let(:text) { 'https://www.ruby-toolbox.com/search?utf8=%E2%9C%93&q=autolink' }

        it 'matches the full URL' do
          is_expected.to include 'href="https://www.ruby-toolbox.com/search?utf8=%E2%9C%93&amp;q=autolink"'
        end
      end

      context 'with unicode character' do
        let(:text) { 'https://www.ruby-toolbox.com/search?utf8=✓&q=autolink' }

        it 'matches the full URL' do
          is_expected.to include 'href="https://www.ruby-toolbox.com/search?utf8=✓&amp;q=autolink"'
        end
      end

      context 'with unicode character at the end' do
        let(:text) { 'https://www.ruby-toolbox.com/search?utf8=✓' }

        it 'matches the full URL' do
          is_expected.to include 'href="https://www.ruby-toolbox.com/search?utf8=✓"'
        end
      end

      context 'with escaped and not escaped unicode characters' do
        let(:text) { 'https://www.ruby-toolbox.com/search?utf8=%E2%9C%93&utf81=✓&q=autolink' }

        it 'preserves escaped unicode characters' do
          is_expected.to include 'href="https://www.ruby-toolbox.com/search?utf8=%E2%9C%93&amp;utf81=✓&amp;q=autolink"'
        end
      end

      context 'given a URL with parentheses in it' do
        let(:text) { 'https://en.wikipedia.org/wiki/Diaspora_(software)' }

        it 'matches the full URL' do
          is_expected.to include 'href="https://en.wikipedia.org/wiki/Diaspora_(software)"'
        end
      end

      context 'given a URL in quotation marks' do
        let(:text) { '"https://example.com/"' }

        it 'does not match the quotation marks' do
          is_expected.to include 'href="https://example.com/"'
        end
      end

      context 'given a URL in angle brackets' do
        let(:text) { '<https://example.com/>' }

        it 'does not match the angle brackets' do
          is_expected.to include 'href="https://example.com/"'
        end
      end

      context 'given a URL containing unsafe code (XSS attack, invisible part)' do
        let(:text) { %q{http://example.com/blahblahblahblah/a<script>alert("Hello")</script>} }

        it 'does not include the HTML in the URL' do
          is_expected.to include '"http://example.com/blahblahblahblah/a"'
        end

        it 'does not include a script tag' do
          is_expected.to_not include '<script>'
        end
      end

      context 'given text containing HTML code (script tag)' do
        let(:text) { '<script>alert("Hello")</script>' }

        it 'does not include a script tag' do
          is_expected.to_not include '<script>'
        end
      end

      context 'given text containing HTML (XSS attack)' do
        let(:text) { %q{<img src="javascript:alert('XSS');">} }

        it 'does not include the javascript' do
          is_expected.to_not include 'href="javascript:'
        end
      end

      context 'given an invalid URL' do
        let(:text) { 'http://www\.google\.com' }

        it 'outputs the raw URL' do
          is_expected.to eq '<p>http://www\.google\.com</p>'
        end
      end

      context 'given text containing a hashtag' do
        let(:text)  { '#hashtag' }

        it 'creates a hashtag link' do
          is_expected.to include '/tags/hashtag" class="mention hashtag" rel="tag">#<span>hashtag</span></a>'
        end
      end

      context 'given text containing a hashtag with Unicode chars' do
        let(:text)  { '#hashtagタグ' }

        it 'creates a hashtag link' do
          is_expected.to include '/tags/hashtag%E3%82%BF%E3%82%B0" class="mention hashtag" rel="tag">#<span>hashtagタグ</span></a>'
        end
      end

      context 'given text with a stand-alone xmpp: URI' do
        let(:text) { 'xmpp:user@instance.com' }

        it 'matches the full URI' do
          is_expected.to include 'href="xmpp:user@instance.com"'
        end
      end

      context 'given text with an xmpp: URI with a query-string' do
        let(:text) { 'please join xmpp:muc@instance.com?join right now' }

        it 'matches the full URI' do
          is_expected.to include 'href="xmpp:muc@instance.com?join"'
        end
      end

      context 'given text containing a magnet: URI' do
        let(:text) { 'wikipedia gives this example of a magnet uri: magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a' }

        it 'matches the full URI' do
          is_expected.to include 'href="magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a"'
        end
      end
    end
  end
end
