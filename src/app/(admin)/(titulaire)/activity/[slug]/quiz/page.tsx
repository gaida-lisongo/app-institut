const QCMPage = ({ params }: { params: { slug: string } }) => {
    const { slug } = params;

    return (
        <h1>QCM Page for activity: {slug}</h1>
    );
};

export default QCMPage;