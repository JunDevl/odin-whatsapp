export const generateUserFriendRoom = (input1: string, input2: string) => {
  const separator = "-";

  let result = input1.length > input2.length ?
    Array.from(input1).reduce((prev, cur, i) => `${prev}${cur}${separator}${input2[i] ?? ""}`) :
    Array.from(input2).reduce((prev, cur, i) => `${prev}${cur}${separator}${input1[i] ?? ""}`)

  return result;
}