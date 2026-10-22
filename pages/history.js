export default function RetiredHistory() { return null; }
export function getServerSideProps() {
  return { redirect: { destination: "/#boards", permanent: false } };
}
