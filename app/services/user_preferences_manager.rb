class UserPreferencesManager
  DEFAULT_PREFERENCES = {
    text: "my preferences",
    items: [{
      text: "keyboard shortcuts",
      items: [{
        text: "ctrl + enter",
        items: [{
          text: "enter command mode",
          items: []
        }]
      },{
        text: "alt + =",
        items: [{
          text: "add text \"\\[=]\"",
          items: []
        }]
      },{
        text: "alt + shift + ;",
        items: [{
          text: "add text \"\\[:]\"",
          items: []
        }]
      },{
        text: "alt + 0",
        items: [{
          text: "goto -1",
          items: []
        }]
      },{
        text: "alt + spacebar",
        items: [{
          text: "goto ($parent)",
          items: []
        }]
      },{
        text: "ctrl + spacebar",
        items: [{
          text: "toggle collapse",
          items: []
        }]
      },{
        text: "ctrl + right",
        items: [{
          text: "zoom in",
          items: []
        }]
      },{
        text: "ctrl + left",
        items: [{
          text: "zoom out",
          items: []
        }]
      },{
        text: "ctrl + up",
        items: [{
          text: "collapse all",
          items: []
        }]
      },{
        text: "ctrl + down",
        items: [{
          text: "expand all",
          items: []
        }]
      },{
        text: "ctrl + alt + up",
        items: [{
          text: "collapse items recursively",
          items: []
        }]
      },{
        text: "ctrl + shift + d",
        items: [{
          text: "duplicate",
          items: []
        }]
      },{
        text: "ctrl + shift + delete",
        items: [{
          text: "delete",
          items: []
        }]
      },{
        text: "ctrl + shift + down",
        items: [{
          text: "move down",
          items: []
        }]
      },{
        text: "ctrl + shift + up",
        items: [{
          text: "move up",
          items: []
        }]
      },{
        text: "ctrl + shift + right",
        items: [{
          text: "indent",
          items: []
        }]
      },{
        text: "ctrl + shift + left",
        items: [{
          text: "outdent",
          items: []
        }]
      },{
        text: "ctrl + shift + spacebar",
        items: [{
          text: "toggle collapse siblings",
          items: []
        }]
      },{
        text: "alt + enter",
        items: [{
          text: "new item",
          items: []
        }]
      },{
        text: "ctrl + k",
        items: [{
          text: "template \"kanban\"",
          items: []
        }]
      },{
        text: "ctrl + w",
        items: [{
          text: "template \"days of the week\"",
          items: []
        }]
      }]
    },{
      text: "templates",
      items: [{
        text: "kanban",
        items: [{
          text: "DONE",
          items: []
        },{
          text: "IN PROGRESS",
          items: []
        },{
          text: "TODO",
          items: []
        }]
      },{
        text: "days of the week",
        items: [{
          text: "Monday",
          items: []
        },{
          text: "Tuesday",
          items: []
        },{
          text: "Wednesday",
          items: []
        },{
          text: "Thursday",
          items: []
        },{
          text: "Friday",
          items: []
        },{
          text: "Saturday",
          items: []
        },{
          text: "Sunday",
          items: []
        }]
      }]
    },{
      text: "onpageload",
      items: [{
        text: '// remove the "//" to execute the commands when the page loads',
        items: []
      },{
        text: '//hide header',
        items: []
      },{
        text: '//change theme "dark"',
        items: [{
          text: 'default theme is "light"',
          items: []
        }]
      },{
        text: '//change font "Courier New"',
        items: [{
          text: 'see fonts.google.com for other available fonts'
        }]
      }]
    }]
  }

  OOBE_WELCOME_MESSAGE = {
    text: 'Welcome to Calculist! Select this item and press ctrl + spacebar to expand.',
    collapsed: true,
    items: [{
      text: 'This is your home page, where you can find all of your lists',
    },{
      text: 'You can find help topics on the GitHub wiki',
      items: [{
        text: 'https://github.com/calculist/calculist/wiki'
      }]
    },{
      text: 'To create a new list ...',
      items: [{
        text: 'enter command mode by pressing ctrl + enter'
      },{
        text: 'type "new list \'Title\'" (where "Title" is the title of your new list)'
      },{
        text: 'hit enter'
      }]
    },{
      text: 'To open one of your existing lists ...',
      items: [{
        text: 'select the item with the name of the list you want to go to'
      },{
        text: 'enter command mode by pressing ctrl + enter'
      },{
        text: 'then type "goto list"'
      },{
        text: 'hit enter'
      }]
    }]
  }

  LIST_STATS =     {
    text: "stats",
    items: [
      {
        text: "list count [=] count(lists)",
      },{
        text: "total update count [=] sum(lists[\"update_count\"])",
      },{
        text: "total item count [=] sum(lists[\"item_count\"])",
      },{
        text: "list with most items [=] $items.list + \" (\" + $items.max_item_count + \" items)\"",
        collapsed: true,
        items: [
          {
            text: "max item count [=] max(lists[\"item_count\"])",
          },{
            text: "finding function [=] flow(item(\"item_count\"), eq(max_item_count))",
          },{
            text: "list [=] find(lists, finding_function)",
          }
        ],
      },{
        text: "list with fewest items [=] $items.list + \" (\" + $items.min_item_count + \" items)\"",
        collapsed: true,
        items: [
          {
            text: "min item count [=] min(lists[\"item_count\"])",
          },{
            text: "finding function [=] flow(item(\"item_count\"), eq(min_item_count))",
          },{
            text: "list [=] parentOf(min(lists[\"item_count\"]))",
          }
        ],
      },{
        text: "average items per list [=] round(mean(lists[\"item_count\"]), 2)",
      },{
        text: "median items per list [=] median(lists[\"item_count\"])",
      },{
        text: "standard deviation [=] round(standardDeviation(lists[\"item_count\"]), 2)",
      },{
        text: "most updated list [=] $items.list + \" (\" + $items.max_update_count + \" updates)\"",
        collapsed: true,
        items: [
          {
            text: "max update count [=] max(lists[\"update_count\"])",
          },{
            text: "finding function [=>] list | list.update_count == max_update_count",
          },{
            text: "list [=] find(lists, finding_function)",
          }
        ],
      }
    ],
  }

  def initialize(user_id)
    @user_id = user_id
  end

  def create_primary_list_items
    im = ItemManager.new(user.primary_list.id)
    im.create_items_from_tree({
      text: user.primary_list.title,
      items: [LIST_STATS, OOBE_WELCOME_MESSAGE]
    })
  end

  def create_preference_items
    im = ItemManager.new(user.preferences.id)
    im.create_items_from_tree(DEFAULT_PREFERENCES)
  end

  private

  def user
    @user ||= User.find(@user_id)
  end

end
