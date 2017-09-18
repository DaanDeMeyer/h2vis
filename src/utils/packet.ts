
//
// export function segmentRelatedSegments(segment: Segment, connection: Connection): Array<Segment> {
//     const relatedMessages = segmentRelatedMessages(segment, connection);
//     return _.flatMap(relatedMessages, message => messageRelatedSegments(message, connection));
// }
//
// export function messageRelatedSegments(message: Message, connection: Connection): Array<Segment> {
//     return message.segmentIds.map(id => connection.segments[id]);
// }
//
// export function segmentRelatedMessages(segment: Segment, connection: Connection): Array<Message> {
//     const allMessagesArray = _.map(connection.streams, stream => stream.messages);
//     const allMessagesObject: Dictionary<Message> = _.reduce(allMessagesArray, _.assign);
//     return segment.messageIds.map(id => allMessagesObject[id]);
// }
//
// export function messageRelatedMessages(message: Message, connection: Connection): Array<Message> {
//     const relatedSegments = messageRelatedSegments(message, connection);
//     return _.flatMap(relatedSegments, segment => segmentRelatedMessages(segment, connection));
// }