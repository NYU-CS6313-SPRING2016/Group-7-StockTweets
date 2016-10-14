from models import *

CONSOLE_INDENT = '    '

def db_save_message(message):
    CONSOLE_INDENT = '    '
    if 'symbols' not in message:
        print '%sNo symbols field found in message %d' % (CONSOLE_INDENT, message['id'])
        return
    if len(message['symbols']) == 0:
        print '%sNo symbols in message %d' % (CONSOLE_INDENT, message['id'])
        return
    # Parse message
    try:
        msg, created = Message.objects.get_or_create(message_id=message['id'],
                                                defaults={'body':message['body'], 'created_at':message['created_at'],
                                                'sentiment':'Nothing'})
        if created == False:
            print '%sMessage %d already exists.' % (CONSOLE_INDENT, msg.message_id)
            return
    except Exception as e:
        print '%sMessage %d occurs exception when creating message. Info: %s' % (CONSOLE_INDENT, msg.message_id, e)
        return
    # Parse user
    try:
        user, created = User.objects.get_or_create(user_id=message['user']['id'],
                                                defaults={'username':message['user']['username'], 'name':message['user']['name']})
        msg.user = user
        msg.save()
        if created == False:
            user.count += 1
            user.save()
    except Exception as e:
        print '%sMessage %d occurs exception when creating message. Info: %s' % (CONSOLE_INDENT, msg.message_id, e)
        return
    # Parse symbols
    try:
        for each_symbol in message['symbols']:
            if each_symbol['sector'] == None or each_symbol['industry'] == None:
                continue
            else:
                symbol, created = Symbol.objects.get_or_create(symbol_id=each_symbol['id'],
                                                                defaults={'symbol':each_symbol['symbol'], 'title':each_symbol['title'],
                                                                        'exchange':each_symbol['exchange'], 'sector':each_symbol['sector']})
                if created == False:
                    symbol.count += 1
                # Parse each symbol to map message
                new_map = Map(message_id=msg.message_id, symbol=symbol)
                new_map.save()
    except Exception as e:
        print '%sMessage %d occurs exception when creating symbols. Info: %s' % (CONSOLE_INDENT, msg.message_id, e)
        return
        
    print '%sMessage %d created.' % (CONSOLE_INDENT, msg.message_id)



# def delete_earlest_message():
#     all_message = Message.objects.all()
#     if len(all_message) > 3500:
#         del_num = 4
#     elif len(all_message) > 3000:
#         del_num = 2
#     elif len(all_message) > 2800:
#         del_num = 1
#     else:
#         return
#     del_message = all_message.order_by('created_at')[:del_num]
#     message_id_list = []
#     for msg in del_message:
#         message_id_list.append(int(msg.message_id))
#     del_map = Map.objects.all().filter(message_id__in=message_id_list)
#     for item in del_message:
#         print '    Message %d is deleted' % item.message_id
#         item.delete()
#     for item in del_map:
#         print '    Map for message %d is deleted' % item.message_id
#         item.delete()

# def get_symbol_id(request):
#     try:
#         if 'symbol_id' in request.GET:
#             return int(request.GET['symbol_id'])
#         elif 'symbol' in request.GET:
#             symbol_id = Symbol.objects.get(symbol=request.GET['symbol']).symbol_id
#             return symbol_id
#     except:
#         pass
#     return -1



