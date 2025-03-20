import { FC } from "react";
import { StyleSheet, Document, Page, Text, View } from "@react-pdf/renderer";
import { markedToHTML } from "../utils/markdown";

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "Times-Roman",
  },
  summary: {
    fontSize: 14,
    marginBottom: 12,
    fontFamily: "Times-Roman",
  },
  premise: {
    marginBottom: 12,
  },
  premiseContent: {
    fontSize: 14,
    fontFamily: "Times-Roman",
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Times-Roman",
  },
  outline: {
    marginBottom: 20,
    marginLeft: 12,
    marginRight: 12,
    fontFamily: "Times-Roman",
  },
  outlineTitle: {
    fontSize: 14,
    marginBottom: 3,
    fontWeight: "bold",
    fontFamily: "Times-Roman",
  },
  outlineContent: {
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Times-Roman",
  },
  image: {
    marginVertical: 15,
    marginHorizontal: 100,
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});

interface OutlineDocumentProps {
  title: string;
  summary?: string;
  premise: string;
  outline: Array<{ title: string; content: string }>;
}

export const OutlineDocument: FC<OutlineDocumentProps> = ({
  title,
  summary,
  premise,
  outline,
}) => (
  <Document>
    <Page style={styles.body}>
      <Text style={styles.header} fixed>
        ~ Created with Freeplotter.com ~
      </Text>

      <Text style={styles.title}>{title}</Text>

      {!!summary?.length && <Text style={styles.summary}>{summary}</Text>}

      {premise && (
        <View style={styles.premise}>
          <Text style={styles.sectionTitle}>Premise</Text>
          <Text style={styles.premiseContent}>{premise}</Text>
        </View>
      )}

      {!!outline.length && (
        <>
          <Text style={styles.sectionTitle}>Outline</Text>

          {outline.map((item) => {
            return (
              <View key={item.title} style={styles.outline}>
                <Text key={item.title} style={styles.outlineTitle}>
                  {markedToHTML(item.title)}
                </Text>
                <Text key={item.title} style={styles.outlineContent}>
                  {markedToHTML(item.content)}
                </Text>
              </View>
            );
          })}
        </>
      )}
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);
