// calculist.register('commandCenter', ['_', '$'], function (_, $) {
//   var input = $('#command-center');

//   var commands = [
//     'new list',
//     'open list',
//     // 'share list (coming soon)',
//     'view settings',
//   ];

//   input.typeahead({ highlight: true, minLength: 0 }, {
//     name: 'global-commands',
//     source: function (query, results) {
//       results(query === '.' ? commands : _.filter(commands, function (command) {
//         return _.includes(command, query);
//       }));
//     }
//   // },{
//   //   name: 'list-commands',
//   //   source: function (query, results) {
//   //     results(query === '.' ? commands : _.filter(commands, function (command) {
//   //       return _.includes(command, query);
//   //     }));
//   //   }
//   });

//   return {
//     focus: function () {
//       input.focus();
//     }
//   };
// });
