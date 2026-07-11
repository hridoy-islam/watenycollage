import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet
} from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica'
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
  signatureImage: {
    width: 100,
    height: 50,
    marginVertical: 6,
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

const renderText = (text: string, lineIndex: number) => {
  const tagRegex = /<(b|i)>(.*?)<\/\1>/g;
  const parts: (string | JSX.Element)[] = [];
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
    if (part === '<center>') { isCentered = true; return; }
    if (part === '</center>') { isCentered = false; centerIndex++; return; }
    if (!part.trim()) return;

    const lines = part.split('\n');
    const localElements: JSX.Element[] = [];

    lines.forEach((line, i) => {
      if (i > 0) {
        localElements.push(<View key={`nl-${i}`} style={styles.br} />);
      }

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
          const rendered = renderText(inner, `${i}-${brIndex}`);
          localElements.push(
            <Text key={`hd-${i}-${brIndex}`} style={headerMatch ? styles.heading : styles.subtitle}>
              {rendered}
            </Text>
          );
          return;
        }

        const rendered = renderText(brPart, i);
        localElements.push(
          <Text key={`line-${i}-${brIndex}`} style={styles.body}>
            {rendered}
          </Text>
        );
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

interface JobContractPdfProps {
  contractContent: string;
  signatureUrl?: string;
  createdAt?: string;
}

export const JobContractPdf = ({
  contractContent,
  signatureUrl,
  createdAt
}: JobContractPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.logoContainer}>
        <Image src="/logo.png" style={styles.logo} />
      </View>

      <View style={{ marginTop: 10 }}>
        {renderBody(contractContent)}
      </View>

      {signatureUrl && (
        <View style={{ marginTop: 16 }}>
          <Image src={signatureUrl} style={styles.signatureImage} />
        </View>
      )}

     

      <View style={styles.pageNumberContainer} fixed>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </View>
    </Page>
  </Document>
);
