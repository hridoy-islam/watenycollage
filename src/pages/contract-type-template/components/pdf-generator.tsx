import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image
} from '@react-pdf/renderer';
import moment from 'moment';

const MOCK_DATA: Record<string, string> = {
  name: 'Mr John Doe',
  title: 'Mr',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: moment('1990-05-15').format('DD/MM/YYYY'),
  email: 'john.doe@example.com',
  phone: '+44 7700 900123',
  nationality: 'British',
  countryOfResidence: 'UK',
  gender: 'Male',
  postalAddressLine1: '221B Baker Street',
  postalCity: 'London',
  postalPostCode: 'NW1 6XE',
  postalCountry: 'UK',
  position: 'Care Worker',
  employmentType: 'full-time',
  noticePeriod: '1 month',
  availableFromDate: '15/09/2025',
  applicationDate: '01/09/2025',
  jobTitle: 'Senior Care Assistant',
  admin: 'Watney College',
  adminEmail: 'info@watneycollege.co.uk',
  userSignature: '/signature.png',
  todayDate: moment().format('DD/MM/YYYY')
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,

  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  logoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5
  },
  logo: {
    width: 90,
    height: 50
  },
  body: {
    fontSize: 10,
    lineHeight: 1,
    textAlign: 'justify',
    marginBottom: 4
  },
  bold: {
    fontWeight: 'bold'
  },
  italic: {
    fontStyle: 'italic'
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 4
  },
  br: {
    marginBottom: 8
  },
  signature: {
    width: 100,
    height: 50,
    marginVertical: 3,
    objectFit: 'contain'
  },
  pageNumber: {
    textAlign: 'center',
    fontSize: 8,
    color: '#999'
  },
  pageNumberContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0
  }
});

const renderText = (text, lineIndex) => {
  const tagRegex = /<(b|i)>(.*?)<\/\1>/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const tag = match[1];
    const content = match[2];
    parts.push(
      <Text key={`fmt-${lineIndex}-${match.index}`} style={tag === 'b' ? styles.bold : styles.italic}>
        {content}
      </Text>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

const renderBody = (body: string) => {
  const centerParts = body.split(/(<center>|<\/center>)/g);
  const elements: JSX.Element[] = [];
  let isCentered = false;
  let centerIndex = 0;

  centerParts.forEach((part) => {
    if (part === '<center>') {
      isCentered = true;
      return;
    }
    if (part === '</center>') {
      isCentered = false;
      centerIndex++;
      return;
    }
    if (!part.trim()) return;

    const lines = part.split('\n');
    const localElements: JSX.Element[] = [];

    lines.forEach((line, i) => {
      const brRegex = /<br\s*\/?>/g;
      const brParts = line.split(brRegex);

      brParts.forEach((brPart, brIndex) => {
        if (brIndex > 0) {
          localElements.push(<View key={`br-${i}-${brIndex}`} style={styles.br} />);
        }

        if (brPart.trim() === '') return;

        const headerMatch = brPart.match(/^<header>(.*)<\/header>$/);
        const subtitleMatch = brPart.match(/^<subtitle>(.*)<\/subtitle>$/);
        if (headerMatch || subtitleMatch) {
          const inner = headerMatch ? headerMatch[1] : subtitleMatch[1];
          let resolved = inner.replace(/\[([^\]]+)\]/g, (_, key) => MOCK_DATA[key] || `[${key}]`);
          const rendered = renderText(resolved, `${i}-${brIndex}`);
          localElements.push(
            <Text key={`hd-${i}-${brIndex}`} style={headerMatch ? styles.heading : styles.subtitle}>
              {rendered}
            </Text>
          );
          return;
        }

        const placeholderRegex = /\[([^\]]+)\]/g;
        const segments: { type: 'text' | 'image'; content: string }[] = [];
        let lastIndex = 0;
        let match;

        while ((match = placeholderRegex.exec(brPart)) !== null) {
          const key = match[1];

          if (match.index > lastIndex) {
            segments.push({ type: 'text', content: brPart.slice(lastIndex, match.index) });
          }

          const value = MOCK_DATA[key];
          if (value) {
            if (key === 'userSignature' || value.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
              segments.push({ type: 'image', content: value });
            } else {
              segments.push({ type: 'text', content: value });
            }
          }

          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < brPart.length) {
          segments.push({ type: 'text', content: brPart.slice(lastIndex) });
        }

        const collapsed: { type: 'text' | 'image'; content: string }[] = [];
        for (const seg of segments) {
          if (seg.type === 'text' && collapsed.length > 0 && collapsed[collapsed.length - 1].type === 'text') {
            collapsed[collapsed.length - 1].content += seg.content;
          } else {
            collapsed.push({ ...seg });
          }
        }

        const hasImage = collapsed.some(s => s.type === 'image');

        if (hasImage) {
          const jsxParts: JSX.Element[] = [];
          collapsed.forEach((seg, idx) => {
            if (seg.type === 'image') {
              jsxParts.push(<Image key={`img-${i}-${brIndex}-${idx}`} src={seg.content} style={styles.signature} />);
            } else {
              const rendered = renderText(seg.content, i);
              if (Array.isArray(rendered)) {
                jsxParts.push(...rendered);
              } else {
                jsxParts.push(<Text key={`txt-${i}-${brIndex}-${idx}`}>{rendered}</Text>);
              }
            }
          });
          localElements.push(<View key={`line-${i}-${brIndex}`}>{jsxParts}</View>);
        } else {
          const fullText = collapsed.map(s => s.content).join('');
          const rendered = renderText(fullText, i);
          localElements.push(
            <Text key={`line-${i}-${brIndex}`} style={styles.body}>
              {rendered}
            </Text>
          );
        }
      });
    });

    if (isCentered) {
      elements.push(
        <View key={`center-${centerIndex}`} style={{ alignItems: 'center' }}>
          {localElements}
        </View>
      );
    } else {
      elements.push(...localElements);
    }
  });

  return elements;
};

const ContractPDF = ({ subject, body }: { subject: string; body: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.logoContainer}>
        <Image src="/logo.png" style={styles.logo} />
      </View>

      <View style={styles.section}>
        {renderBody(body)}
      </View>

      <View style={styles.pageNumberContainer} fixed>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </View>
    </Page>
  </Document>
);

export const downloadContractPDF = async (subject: string, body: string) => {
  try {
    const blob = await pdf(<ContractPDF subject={subject} body={body} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contract-template-${moment().format('YYYY-MM-DD-HHmm')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
