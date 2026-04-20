

const handleUtilsConsumer =async (data:{type:string,data:any})=>{
    try {
        switch (data.type) {
            case 'log':
                console.log('Log from Kafka:', data.data);
                break;
            // Add more cases for different types of messages if needed
            default:
                console.warn('Unknown message type:', data.type);
        }
        
    } catch (error) {
        console.error('Error handling Kafka message:', error);
    }
}


export default handleUtilsConsumer;